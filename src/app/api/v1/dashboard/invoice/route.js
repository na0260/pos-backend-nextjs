import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function POST(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const reqBody = await req.json();
        reqBody.user_id = parseInt(id);
        const prisma = new PrismaClient();

        const customer = await prisma.customers.findUnique({
            where: {
                id: reqBody.customer_id,
                user_id: reqBody.user_id
            }
        });

        if (!customer){
            return NextResponse.json({status: "Failed", data: "Customer not found"}, {status: 404});
        }else {
            const product = await prisma.products.findUnique({
                where: {
                    id: reqBody.product_id,
                    user_id: reqBody.user_id
                }
            });
            if (!product){
                return NextResponse.json({status: "Failed", data: "Product not found"}, {status: 404});
            }else {
                if (parseInt(product['unit']) <= parseInt(reqBody.qty)){
                    return NextResponse.json({status: "Failed", data: `Not enough products. Remaining = ${product['unit']}`}, {status: 400});
                }else {
                    const total = parseInt(reqBody.qty) * parseInt(product['price']);
                    const discount = total * parseInt(reqBody.discount) / 100;
                    const vat = total * parseInt(reqBody.vat) / 100;
                    const payable = (total - discount) + vat;
                    const remaining = parseInt(product['unit']) - parseInt(reqBody.qty);
                    const result = await prisma.$transaction(async (prisma) =>{
                        const invoice = await prisma.invoices.create({
                            data: {
                                total: total.toString(),
                                discount: discount.toString(),
                                vat: vat.toString(),
                                payable: payable.toString(),
                                customer_id: reqBody.customer_id,
                                user_id: reqBody.user_id
                            }
                        });
                        const invoiceProducts = await prisma.invoice_products.create({
                            data:{
                                qty: reqBody.qty,
                                sale_price: product['price'],
                                user_id: reqBody.user_id,
                                product_id: reqBody.product_id,
                                invoice_id: invoice.id
                            }
                        })
                        const updateProduct = await prisma.products.update({
                            where: {
                                id: reqBody.product_id,
                                user_id: reqBody.user_id
                            },
                            data: {
                                unit: remaining.toString()
                            }
                        });
                        return {invoice, invoiceProducts, updateProduct};
                    });


                    return NextResponse.json({status: "Success", data: result}, {status: 201});
                }
            }
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}