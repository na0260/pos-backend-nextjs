import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {SendEmail} from "@/utility/EmailUtility";
import bcrypt from "bcrypt";

export async function GET(req){
    try {
        const {searchParams} = new URL(req.url);
        const email = searchParams.get('email');
        const prisma = new PrismaClient();
        const startTime = new Date();
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
                const executionTime = new Date() - startTime;
                return NextResponse.json({status: "Success", data: "6 Digit OTP has been sent to your email", execution_time:`${executionTime}ms`}, {status: 200});
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

export async function POST(req){
    try {
        const reqBody = await req.json();
        const prisma = new PrismaClient();
        const startTime = new Date();
        const user = await prisma.users.findUnique({
            where: {
                email: reqBody.email
            }
        });
        const executionTime = new Date() - startTime;
        if (!user){
            return NextResponse.json({status: "Failed", data: "User not found"}, {status: 404});
        }else {
            if (user.otp === reqBody.otp){
                return NextResponse.json({status: "Success", data: "OTP Verified", execution_time:`${executionTime}ms`}, {status: 200});
            }else {
                return NextResponse.json({status: "Failed", data: "Invalid OTP"}, {status: 400});
            }
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}

export async function PUT(req){
    try {
        const reqBody = await req.json();
        const prisma = new PrismaClient();
        const startTime = new Date();
        const user = await prisma.users.findUnique({
            where: {
                email: reqBody.email
            }
        });
        if (!user){
            return NextResponse.json({status: "Failed", data: "User not found"}, {status: 404});
        }else {
            if (user.otp === reqBody.otp) {
                const newOtp = Math.floor(100000 + Math.random() * 900000);
                let password = reqBody.password;
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.users.update({
                    where: {
                        email: reqBody.email
                    },
                    data: {
                        password: hashedPassword,
                        otp: newOtp.toString()
                    }
                });
                const executionTime = new Date() - startTime;
                return NextResponse.json({status: "Success", data: "Password Reset Successful", execution_time:`${executionTime}ms`}, {status: 200});
            }else {
                return NextResponse.json({status: "Failed", data: "Invalid OTP"}, {status: 400});
            }
        }
    }catch (e) {
        return NextResponse.json({status: "Failed", data: e.message}, {status: 500});
    }
}