// SPWNAPP Official Store Service
// Dynamic Google Apps Script Connector

const STORE_API_URL =
  import.meta.env.VITE_STORE_API_URL ||
  "https://script.google.com/macros/s/AKfycbyePD0yr_xJE2R9MeVugBzE_49DkHaSzJJBJQsl033bgiGhbu-5nFuLxFf1oy2rN0QN7w/exec";


function checkAPI(){

  if(!STORE_API_URL){
    throw new Error(
      "STORE API belum dikonfigurasi"
    );
  }

}


export async function getStoreProducts(){

  try {

    checkAPI();

    const response = await fetch(
      `${STORE_API_URL}?action=GET_OFFICIAL_STORE`,
      {
        method:"GET"
      }
    );


    const text = await response.text();


    let result;

    try{

      result = JSON.parse(text);

    }catch{

      console.error(
        "Response API bukan JSON:",
        text.substring(0,200)
      );

      throw new Error(
        "Google Apps Script tidak mengembalikan JSON"
      );

    }


    return result.success
      ? result.data || []
      : [];


  } catch(error){

    console.error(
      "[STORE API ERROR]",
      error
    );

    return [];

  }

}



export async function deleteStoreProduct(
  id:string
){

  checkAPI();


  const response = await fetch(
    STORE_API_URL,
    {

      method:"POST",

      headers:{
        "Content-Type":
        "text/plain;charset=utf-8"
      },

      body:JSON.stringify({

        action:
        "DELETE_OFFICIAL_STORE",

        data:{
          ID:id
        }

      })

    }
  );


  return response.json();

}
