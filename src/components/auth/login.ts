import type { VercelRequest, VercelResponse } from '@vercel/node';


const GAS_URL =
  "https://script.google.com/macros/s/AKfycbzo5kpGHe8uGv5lBX8m4gU5bcF5OvyyPwRlU7ExhArEtQVUTbpN0FjG9fTG468gxha5vg/exec";



export default async function handler(
  req: VercelRequest,
  res: VercelResponse
){

  if(req.method !== "POST"){

    return res.status(405).json({
      success:false,
      message:"Method tidak diizinkan"
    });

  }


  try{


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

            email:req.body.email,

            password:req.body.password

          })
        }
      );


    const result =
      await response.json();



    return res.status(200).json(result);



  }catch(error:any){


    return res.status(500).json({

      success:false,

      message:error.message

    });


  }

}