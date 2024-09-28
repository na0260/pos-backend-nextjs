import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function GET(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const prisma = new PrismaClient();
        const {searchParams} = new URL(req.url);
        const categoryId = searchParams.get("cat_id");
        if (categoryId){
            const category = await prisma.categories.findUnique({
                where:{
                    id: parseInt(categoryId),
                    user_id: parseInt(id)
                }
            });
            if (!category){
                return NextResponse.json({status: "Failed", data: "Category not found"}, {status: 404});
            }else {
                const products = await prisma.products.findMany({
                    where:{
                        user_id: parseInt(id),
                        category_id: parseInt(categoryId)
                    }
                });

                return NextResponse.json({status: "Success", data: products}, {status: 200});
            }
        }else {
            const products = await prisma.products.findMany({
                where:{
                    user_id: parseInt(id)
                }
            });

            return NextResponse.json({status: "Success", data: products}, {status: 200});
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function POST(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const reqBody = await req.json();
        reqBody.user_id = parseInt(id);
        const prisma = new PrismaClient();
        const category = await prisma.categories.findUnique({
            where:{
                id: reqBody.category_id,
                user_id: parseInt(id)
            }
        });
        if (!category){
            return NextResponse.json({status: "Failed", data: "Category not found"}, {status: 404});
        }else {
            const result = await prisma.products.create({
                data: reqBody
            });

            return NextResponse.json({status: "Success", data: result}, {status: 201});
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}