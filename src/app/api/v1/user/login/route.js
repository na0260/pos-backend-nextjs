import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {createToken} from "@/utility/JWTHelper";

export async function POST(req) {
    try {
        const reqBody = await req.json();
        const prisma = new PrismaClient();
        const startTime = new Date();
        const result = await prisma.users.findUnique({
            where: {
                email: reqBody.email,
            }
        });
        const executionTime = new Date() - startTime;
        if (!result) {
            return NextResponse.json({status: "Failed", data: "User Not Found", execution_time:`${executionTime}ms`}, {status: 404})
        } else {
            if (!await bcrypt.compare(reqBody.password, result['password'])) {
                const executionTime = new Date() - startTime;
                return NextResponse.json({status: "Failed", data: "Invalid Password", execution_time:`${executionTime}ms`}, {status: 401})
            }else {
                let token = await createToken(result['email'], result['id']);
                const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const cookieString = `token=${token}; Path=/; expires=${expirationDate.toUTCString()};`;
                const executionTime = new Date() - startTime;
                return NextResponse.json({
                    status: "Success",
                    data: token,
                    execution_time:`${executionTime}ms`
                }, {
                    status: 200,
                    headers: {
                        'Set-Cookie': cookieString
                    }
                })
            }
        }

    } catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500})
    }
}