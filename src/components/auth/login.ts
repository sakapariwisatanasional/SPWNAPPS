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

    const email =
      req.body?.email ||
      req.body?.username ||
      "";

    const password =
      req.body?.password ||
      "";


    if (!email || !password) {

      return res.status(400).json({
        success:false,
        message:"Email/username dan password wajib diisi"
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


    const text =
      await response.text();


    let result:any;

    try {

      result = JSON.parse(text);

    } catch {

      return res.status(502).json({
        success:false,
        message:"Response Google Apps Script tidak valid",
        raw:text.substring(0,200)
      });

    }


    return res.status(200).json(result);


  } catch(error:any) {


    console.error(
      "[AUTH LOGIN API ERROR]",
      error
    );


    return res.status(500).json({
      success:false,
      message:error.message || "Server login gagal"
    });


  }

}
