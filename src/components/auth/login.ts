import type { VercelRequest, VercelResponse } from '@vercel/node';

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzo5kpGHe8uGv5lBX8m4gU5bcF5OvyyPwRlU7ExhArEtQVUTbpN0FjG9fTG468gxha5vg/exec";


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  if (req.method !== "POST") {

    return res.status(405).json({
      success:false,
      message:"Method tidak diizinkan"
    });

  }


  try {

    console.log(
      "[AUTH BODY RAW]",
      req.body
    );


    let body:any = req.body;


    if (typeof body === "string") {

      try {

        body = JSON.parse(body);

      } catch {

        body = {};

      }

    }


    console.log(
      "[AUTH BODY PARSED]",
      body
    );


    const email =
      body?.email ||
      body?.username ||
      body?.ident ||
      "";


    const password =
      body?.password ||
      body?.pass ||
      "";


    console.log(
      "[AUTH CREDENTIAL CHECK]",
      {
        email,
        hasPassword: !!password
      }
    );


    if (!email || !password) {

      return res.status(400).json({

        success:false,

        message:"Email/username dan password wajib diisi",

        debug:{
          emailReceived: email,
          passwordReceived: !!password
        }

      });

    }


    const response =
      await fetch(
        GAS_URL,
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            action:"login",

            email,

            password

          })

        }
      );


    console.log(
      "[GAS RESPONSE STATUS]",
      response.status
    );


    const text =
      await response.text();


    console.log(
      "[GAS RESPONSE BODY]",
      text
    );


    let result:any;


    try {

      result = JSON.parse(text);

    } catch {

      return res.status(502).json({

        success:false,

        message:"Response Google Apps Script tidak valid",

        raw:text.substring(0,500)

      });

    }


    return res.status(200).json(result);



  } catch(error:any) {


    console.error(
      "[AUTH LOGIN ERROR]",
      error
    );


    return res.status(500).json({

      success:false,

      message:error?.message ||
        "Terjadi kesalahan server"

    });


  }

}
