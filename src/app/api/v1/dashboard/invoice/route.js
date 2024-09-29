import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function GET() {
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.invoices.findMany({
            where: {
                user_id: parseInt(id)
            },
            select: {
                id: true,
                total: true,
                discount: true,
                vat: true,
                payable: true,
                customer_id: true,
                invoice_products: {
                    select: {
                        qty: true,
                        products: {
                            select: {
                                name: true,
                                unit: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});

    } catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function POST(req) {
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const reqBody = await req.json();
        reqBody.user_id = parseInt(id);
        const prisma = new PrismaClient();

        const startTime = new Date();
        const customer = await prisma.customers.findUnique({
            where: {
                id: reqBody.customer_id,
                user_id: reqBody.user_id
            }
        });

        if (!customer) {
            return NextResponse.json({status: "Failed", data: "Customer not found"}, {status: 404});
        } else {
            const product = await prisma.products.findUnique({
                where: {
                    id: reqBody.product_id,
                    user_id: reqBody.user_id
                }
            });
            if (!product) {
                return NextResponse.json({status: "Failed", data: "Product not found"}, {status: 404});
            } else {
                if (parseInt(product['unit']) <= parseInt(reqBody.qty)) {
                    return NextResponse.json({
                        status: "Failed",
                        data: `Not enough products. Remaining = ${product['unit']}`
                    }, {status: 400});
                } else {
                    const total = parseInt(reqBody.qty) * parseInt(product['price']);
                    const discount = total * parseInt(reqBody.discount) / 100;
                    const vat = total * parseInt(reqBody.vat) / 100;
                    const payable = (total - discount) + vat;
                    const remaining = parseInt(product['unit']) - parseInt(reqBody.qty);
                    const result = await prisma.$transaction([
                        prisma.invoices.create({
                            data: {
                                total: total.toString(),
                                discount: discount.toString(),
                                vat: vat.toString(),
                                payable: payable.toString(),
                                customer_id: reqBody.customer_id,
                                user_id: reqBody.user_id,
                                invoice_products: {
                                    create: {
                                        qty: reqBody.qty,
                                        sale_price: product['price'],
                                        product_id: reqBody.product_id,
                                        user_id: reqBody.user_id
                                    }
                                }
                            }
                        }),
                        prisma.products.update({
                            where: {
                                id: reqBody.product_id,
                                user_id: reqBody.user_id
                            },
                            data: {
                                unit: remaining.toString()
                            }
                        })
                    ]);

                    const executionTime = new Date() - startTime;
                    return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 201});
                }
            }
        }
    } catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PUT(req) {
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const invoice_id = searchParams.get("inv_id");
        const reqBody = await req.json();
        reqBody.user_id = parseInt(id);
        const prisma = new PrismaClient();
        const startTime = new Date();
        const invoice = await prisma.invoices.findUnique({
            where: {
                id: parseInt(invoice_id),
                user_id: reqBody.user_id
            }
        });

        if (!invoice) {
            return NextResponse.json({status: "Failed", data: "Invoice not found"}, {status: 404});
        } else {
            const customer = await prisma.customers.findUnique({
                where: {
                    id: reqBody.customer_id,
                    user_id: reqBody.user_id
                }
            });

            if (!customer) {
                return NextResponse.json({status: "Failed", data: "Customer not found"}, {status: 404});
            } else {
                const product = await prisma.products.findUnique({
                    where: {
                        id: reqBody.product_id,
                        user_id: reqBody.user_id
                    }
                });
                if (!product) {
                    return NextResponse.json({status: "Failed", data: "Product not found"}, {status: 404});
                } else {
                    const invoiceProduct = await prisma.invoice_products.findFirst({
                        where: {
                            invoice_id: parseInt(invoice_id),
                            user_id: reqBody.user_id
                        }
                    });
                    let count = 0;
                    if (invoiceProduct['product_id'] !== reqBody.product_id) {
                        count = parseInt(product['unit']);
                    }else {
                        count = parseInt(invoiceProduct['qty']) + parseInt(product['unit']);
                    }
                    if (reqBody.qty > count) {
                        return NextResponse.json({
                            status: "Failed",
                            data: `Not enough products. Remaining = ${product['unit']}`
                        }, {status: 400});
                    } else {
                        const total = parseInt(reqBody.qty) * parseInt(product['price']);
                        const discount = total * parseInt(reqBody.discount) / 100;
                        const vat = total * parseInt(reqBody.vat) / 100;
                        const payable = (total - discount) + vat;

                        const result = await prisma.$transaction(async (prisma) => {
                            const updateInvoice = await prisma.invoices.update({
                                    where: {
                                        id: parseInt(invoice_id),
                                        user_id: reqBody.user_id
                                    },
                                    data: {
                                        total: total.toString(),
                                        discount: discount.toString(),
                                        vat: vat.toString(),
                                        payable: payable.toString(),
                                        customer_id: reqBody.customer_id,
                                        invoice_products: {
                                            update: {
                                                where: {
                                                    id: invoiceProduct['id'],
                                                    invoice_id: parseInt(invoice_id),
                                                    user_id: reqBody.user_id
                                                },
                                                data: {
                                                    qty: reqBody.qty,
                                                    sale_price: product['price'],
                                                    product_id: reqBody.product_id,
                                                }
                                            }
                                        }
                                    }
                                });
                            let updateProduct;
                            if (invoiceProduct['product_id'] === reqBody.product_id) {
                                const totalProduct = parseInt(product['unit']) + parseInt(invoiceProduct['qty'])
                                const remaining = totalProduct - parseInt(reqBody.qty);
                                updateProduct = await prisma.products.update({
                                    where: {
                                        id: reqBody.product_id,
                                        user_id: reqBody.user_id
                                    },
                                    data: {
                                        unit: remaining.toString()
                                    }
                                });
                            } else {
                                const totalProduct = parseInt(product['unit']);
                                const remaining = totalProduct - parseInt(reqBody.qty);
                                const prevProduct = await prisma.products.findUnique({
                                    where: {
                                        id: invoiceProduct['product_id'],
                                        user_id: reqBody.user_id
                                    }
                                });
                                const prevTotalProduct = parseInt(prevProduct['unit']) + parseInt(invoiceProduct['qty'])
                                updateProduct = await Promise.all([
                                    prisma.products.update({
                                        where: {
                                            id: invoiceProduct['product_id'],
                                            user_id: reqBody.user_id
                                        },
                                        data: {
                                            unit: prevTotalProduct.toString()
                                        }
                                    }),
                                    prisma.products.update({
                                        where: {
                                            id: reqBody.product_id,
                                            user_id: reqBody.user_id
                                        },
                                        data: {
                                            unit: remaining.toString()
                                        }
                                    })
                                ]);
                            }
                            return {updateInvoice, updateProduct};
                        });
                        const executionTime = new Date() - startTime;
                        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
                    }
                }
            }
        }
    } catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PATCH(req) {
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const invoice_id = searchParams.get("inv_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.invoices.findUnique({
            where: {
                id: parseInt(invoice_id),
                user_id: parseInt(id)
            },
            select: {
                id: true,
                total: true,
                discount: true,
                vat: true,
                payable: true,
                customer_id: true,
                invoice_products: {
                    select: {
                        qty: true,
                        products: {
                            select: {
                                name: true,
                                unit: true,
                                price: true
                            }
                        }
                    }
                }
            }
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});

    } catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function DELETE(req) {
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const invoice_id = searchParams.get("inv_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const invoice = await prisma.invoices.findUnique({
            where: {
                id: parseInt(invoice_id),
                user_id: parseInt(id)
            }
        });
        if (!invoice) {
            return NextResponse.json({status: "Failed", data: "Invoice not found"}, {status: 404});
        } else {
            const invoiceProduct = await prisma.invoice_products.findFirst({
                where: {
                    invoice_id: parseInt(invoice_id),
                    user_id: parseInt(id)
                }
            });
            const product = await prisma.products.findUnique({
                where: {
                    id: invoiceProduct['product_id'],
                    user_id: parseInt(id)
                }
            });
            const totalProduct = parseInt(product['unit']) + parseInt(invoiceProduct['qty'])
            const result = await prisma.$transaction(async (prisma) => {
                const deleteInvoiceProduct = await prisma.invoice_products.delete({
                    where: {
                        id: invoiceProduct['id'],
                        invoice_id: parseInt(invoice_id),
                        user_id: parseInt(id)
                    }
                });
                const deleteInvoice = await prisma.invoices.delete({
                    where: {
                        id: parseInt(invoice_id),
                        user_id: parseInt(id)
                    }
                });
                const updateProduct = await prisma.products.update({
                    where: {
                        id: product['id'],
                        user_id: parseInt(id)
                    },
                    data: {
                        unit: totalProduct.toString()
                    }
                });

                return {deleteInvoiceProduct, deleteInvoice, updateProduct};
            })

            const executionTime = new Date() - startTime;
            return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
        }
    } catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}