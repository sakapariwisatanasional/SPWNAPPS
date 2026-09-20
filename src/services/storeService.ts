/**
 * SPWNAPP OFFICIAL STORE SERVICE
 * Dynamic Store API Connector
 *
 * Flow:
 * React
 *   ↓
 * storeService.ts
 *   ↓
 * Google Apps Script Web App
 *   ↓
 * Google Spreadsheet Official_Store
 */


const STORE_API_URL =
  import.meta.env.VITE_STORE_API_URL ||
  "https://script.google.com/macros/s/AKfycbyePD0yr_xJE2R9MeVugBzE_49DkHaSzJJBJQsl033bgiGhbu-5nFuLxFf1oy2rN0QN7w/exec";


export interface StoreProduct {

  ID?: string;

  "Nama Produk":
    string;

  Kategori:
    string;

  Deskripsi:
    string;

  Harga:
    number;

  Material?:
    string;

  Ukuran?:
    string;

  "Foto Produk"?:
    string;

  Gallery?:
    string;

  Stok:
    number;

  Featured?:
    boolean;

  Status:
    string;

  "Tanggal Update"?:
    string;
}



/**
 * GET ALL PRODUCTS
 */

export async function getStoreProducts()
: Promise<StoreProduct[]> {


  try {


    const response =
      await fetch(
        `${STORE_API_URL}?action=GET_OFFICIAL_STORE`
      );


    const result =
      await response.json();



    if(result.success){

      return result.data || [];

    }


    return [];


  } catch(error){

    console.error(
      "[STORE] Load product failed",
      error
    );


    return [];

  }

}





/**
 * CREATE PRODUCT
 */


export async function createStoreProduct(
 product: StoreProduct
){


 return sendStoreAction({

    action:
      "CREATE_OFFICIAL_STORE",

    data:
      product

 });


}






/**
 * UPDATE PRODUCT
 */


export async function updateStoreProduct(
 product: StoreProduct
){


 return sendStoreAction({

    action:
      "UPDATE_OFFICIAL_STORE",

    data:
      product

 });


}







/**
 * DELETE PRODUCT
 */


export async function deleteStoreProduct(
 id:string
){


 return sendStoreAction({

    action:
      "DELETE_OFFICIAL_STORE",

    data:{
      ID:id
    }


 });


}







/**
 * GENERIC POST REQUEST
 */


async function sendStoreAction(
payload:any
){


 try{


 const response =
 await fetch(
    STORE_API_URL,
    {

      method:"POST",

      headers:{
        "Content-Type":
        "text/plain;charset=utf-8"
      },

      body:
      JSON.stringify(payload)

    }
 );



 return await response.json();



 }catch(error){


 console.error(
    "[STORE API ERROR]",
    error
 );


 return {

    success:false,

    message:
    "API tidak tersedia"

 };


 }


}








/**
 * IMAGE UPLOAD
 *
 * File → Base64 → GAS → Google Drive
 */


export async function uploadStoreImage(
file:File
){


return new Promise(
(resolve,reject)=>{


const reader =
new FileReader();



reader.onload =
async()=>{


try{


const result =
await fetch(

STORE_API_URL,

{

method:"POST",

headers:{
"Content-Type":
"text/plain;charset=utf-8"
},


body:
JSON.stringify({

action:
"UPLOAD_OFFICIAL_STORE_IMAGE",


fileName:
file.name,


mimeType:
file.type,


base64:
reader.result

})


});


resolve(
await result.json()
);



}catch(err){

reject(err);

}



};



reader.onerror =
reject;


reader.readAsDataURL(file);



});


}
