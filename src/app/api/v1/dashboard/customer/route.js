import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function GET(){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const customers = await prisma.customers.findMany({
            where:{
                user_id: parseInt(id)
            }
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: customers, execution_time:`${executionTime}ms`}, {status: 200});

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
        const result = await prisma.customers.create({
            data: reqBody
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 201});

    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PUT(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const reqBody = await req.json();
        const {searchParams} = new URL(req.url);
        const customerId = searchParams.get("cus_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.customers.update({
            where:{
                id: parseInt(customerId),
                user_id: parseInt(id)
            },
            data: reqBody
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PATCH(req){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const {searchParams} = new URL(req.url);
        const customerId = searchParams.get("cus_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.customers.findUnique({
            where:{
                id: parseInt(customerId),
                user_id: parseInt(id)
            }
        })
        const executionTime = new Date() - startTime;
        if (!result){
            return NextResponse.json({status: "Failed", data: "Customer not found", execution_time:`${executionTime}ms`}, {status: 404});
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
        const customerId = searchParams.get("cus_id");
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.customers.delete({
            where:{
                id: parseInt(customerId),
                user_id: parseInt(id)
            }
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "Success", data: result, execution_time:`${executionTime}ms`}, {status: 200});
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}
