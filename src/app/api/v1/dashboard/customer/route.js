import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function GET(){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const prisma = new PrismaClient();
        const customers = await prisma.customers.findMany({
            where:{
                user_id: parseInt(id)
            }
        })

        return NextResponse.json({status: "Success", data: customers}, {status: 200});

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
        const result = await prisma.customers.create({
            data: reqBody
        })

        return NextResponse.json({status: "Success", data: result}, {status: 201});

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
        const result = await prisma.customers.update({
            where:{
                id: parseInt(customerId),
                user_id: parseInt(id)
            },
            data: reqBody
        })

        return NextResponse.json({status: "Success", data: result}, {status: 200});
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
        const result = await prisma.customers.findUnique({
            where:{
                id: parseInt(customerId),
                user_id: parseInt(id)
            }
        })

        return NextResponse.json({status: "Success", data: result}, {status: 200});
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
        const result = await prisma.customers.delete({
            where:{
                id: parseInt(customerId),
                user_id: parseInt(id)
            }
        })

        return NextResponse.json({status: "Success", data: result}, {status: 200});
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}
