import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";

export async function POST(req){
    try {
        const reqBody = await req.json();
        let password = reqBody.password;
        reqBody.password = await bcrypt.hash(password, 10);
        reqBody.otp="0";
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.users.create({
            data: reqBody
        });
        const executionTime = new Date() - startTime;
        return NextResponse.json({status: "success", data: result, execution_time:`${executionTime}ms`}, {status: 201});
    }catch (e) {
        return NextResponse.json({status: "failed", data: e.message}, {status: 500});
    }
}