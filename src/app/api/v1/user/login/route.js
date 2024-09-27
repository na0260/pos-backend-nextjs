import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import {createToken} from "@/utility/JWTHelper";

export async function POST(req) {
    try {
        const reqBody = await req.json();
        const prisma = new PrismaClient();
        const result = await prisma.users.findUnique({
            where: {
                email: reqBody.email,
            }
        });

        if (!result) {
            return NextResponse.json({status: "Failed", data: "User Not Found"}, {status: 404})
        } else {
            if (!await bcrypt.compare(reqBody.password, result['password'])) {
                return NextResponse.json({status: "Failed", data: "Invalid Password"}, {status: 401})
            }else {
                let token = await createToken(result['email'], result['id']);
                const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const cookieString = `token=${token}; Path=/; expires=${expirationDate.toUTCString()};`;
                return NextResponse.json({
                    status: "Success",
                    data: token
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