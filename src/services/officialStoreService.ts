// SPWNAPP Official Store Service FINAL
// Khusus Official Merchandise Nasional Saka Pariwisata

const OFFICIAL_STORE_API =
  "https://script.google.com/macros/s/AKfycbyePD0yr_xJE2R9MeVugBzE_49DkHaSzJJBJQsl033bgiGhbu-5nFuLxFf1oy2rN0QN7w/exec";


// Normalisasi data dari Spreadsheet
function normalizeProduct(product:any){

  return {

    id: product.id || product.ID,

    name:
      product.name ||
      product.namaProduk ||
      product.NamaProduk ||
      "",

    category:
      product.category ||
      product.kategori ||
      "",

    description:
      product.description ||
      product.deskripsi ||
      "",

    price:
      Number(
        product.price ||
        product.harga ||
        0
      ),

    stock:
      Number(
        product.stock ||
        product.stok ||
        0
      ),

    imageUrl:
      product.imageUrl ||
      product.fotoProduk ||
      product.foto ||
      "",

    status:
      product.status ||
      "ACTIVE"

  };

}




export async function getOfficialStoreProducts(){

  try{

    const response =
      await fetch(
        `${OFFICIAL_STORE_API}?action=GET_OFFICIAL_STORE`,
        {
          cache:"no-store"
        }
      );


    const result =
      await response.json();


    if(result.success){

      return (
        result.data ||
        result.products ||
        []
      ).map(normalizeProduct);

    }


    return [];


  }catch(error){

    console.error(
      "[Official Store API]",
      error
    );

    return [];

  }

}





export async function createOfficialProduct(data:any){

  const response =
    await fetch(
      OFFICIAL_STORE_API,
      {

        method:"POST",

        headers:{
          "Content-Type":
          "text/plain;charset=utf-8"
        },

        body:JSON.stringify({

          action:
          "CREATE_OFFICIAL_STORE",

          data

        })

      }
    );


  return response.json();

}





export async function updateOfficialProduct(data:any){

  const response =
    await fetch(
      OFFICIAL_STORE_API,
      {

        method:"POST",

        headers:{
          "Content-Type":
          "text/plain;charset=utf-8"
        },

        body:JSON.stringify({

          action:
          "UPDATE_OFFICIAL_STORE",

          data

        })

      }
    );


  return response.json();

}





export async function deleteOfficialProduct(id:string){

  const response =
    await fetch(
      OFFICIAL_STORE_API,
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
            id
          }

        })

      }
    );


  return response.json();

}
