import {NextResponse} from "next/server";
import {headers} from "next/headers";
import {PrismaClient} from "@prisma/client";

export async function GET(){
    try {
        const headerList = headers();
        const id = headerList.get("id");
        const prisma = new PrismaClient();
        const categories = await prisma.categories.findMany({
            where:{
                user_id: parseInt(id)
            }
        })

        return NextResponse.json({status: "Success", data: categories}, {status: 200});

    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function POST(){

}

export async function PUT(){

}

export async function PATCH(){

}
export async function DELETE(){

}
