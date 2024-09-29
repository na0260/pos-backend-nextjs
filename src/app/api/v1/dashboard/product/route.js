import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function GET(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const categoryId = searchParams.get("cat_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
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
                const executionTime = new Date() - startTime;
                return NextResponse.json({status: "Success", data: products, execution_time:`${executionTime}ms`}, {status: 200});
            }
        }else {
            const products = await prisma.products.findMany({
                where:{
                    user_id: parseInt(id)
                }
            });
            const executionTime = new Date() - startTime;
            return NextResponse.json({status: "Success", data: products, execution_time:`${executionTime}ms`}, {status: 200});
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
        const startTime = new Date();
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
            const executionTime = new Date() - startTime;
            return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 201});
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PUT(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const reqBody = await req.json();
        reqBody.user_id = parseInt(id);
        const {searchParams} = new URL(req.url);
        const productId = searchParams.get("pro_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const category = await prisma.categories.findUnique({
            where:{
                id: reqBody.category_id,
                user_id: parseInt(id)
            }
        });
        if (!category){
            return NextResponse.json({status: "Failed", data: "Category not found"}, {status: 404});
        }else {
            const result = await prisma.products.update({
                where:{
                    id: parseInt(productId),
                    user_id: parseInt(id)
                },
                data: reqBody
            });
            const executionTime = new Date() - startTime;
            return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PATCH(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const productId = searchParams.get("pro_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.products.findUnique({
            where:{
                id: parseInt(productId),
                user_id: parseInt(id)
            }
        });
        const executionTime = new Date() - startTime;
        if (!result) {
            return NextResponse.json({status: "Failed", data: "Product not found", execution_time:`${executionTime}ms`}, {status: 404});
        }else {
            return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}
export async function DELETE(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const productId = searchParams.get("pro_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.products.delete({
            where:{
                id: parseInt(productId),
                user_id: parseInt(id)
            }
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}