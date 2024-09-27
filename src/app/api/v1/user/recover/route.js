import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {SendEmail} from "@/utility/EmailUtility";

export async function GET(req){
    try {
        const {searchParams} = new URL(req.url);
        const email = searchParams.get('email');
        const prisma = new PrismaClient();
        const user = await prisma.users.findUnique({
            where: {
                email: email
            }
        });

        if (user){
            const otp = Math.floor(100000 + Math.random() * 900000);
            await prisma.users.update({
                where: {
                    email: email
                },
                data: {
                    otp: otp.toString()
                }
            });
            try {
                const emailSubject = "Password Recovery OTP";
                const emailBody = `Your OTP is ${otp}`;
                await SendEmail(email, emailSubject, emailBody);
                return NextResponse.json({status: "Success", data: "6 Digit OTP has been sent to your email"}, {status: 200});
            }catch (e) {
                return NextResponse.json({status: "Failed", data: "Mail Not sent"}, {status: 500});
            }
        }else {
            return NextResponse.json({status: "Failed", data: "User not found"}, {status: 404});
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}