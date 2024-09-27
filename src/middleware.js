import {NextResponse} from "next/server";
import {verifyToken} from "@/utility/JWTHelper";

export async function middleware(req){
    if (req.nextUrl.pathname.startsWith('/api/v1/dashboard')){
        try {
            let token = req.cookies.get('token');
            let payload = await verifyToken(token['value']);

            const reqHeader = new Headers(req.headers);
            reqHeader.set('email', payload['email']);
            reqHeader.set('id', payload['id']);

            return NextResponse.next({
                request:{
                    headers: reqHeader
                }
            });
        }catch (e) {
            return NextResponse.json({status: 'failed', data: 'Unauthorized'}, {status: 401})
        }
    }

    if (req.nextUrl.pathname.startsWith('/api/v1/user')){
        return  NextResponse.next();
    }
}