// officialStoreService_FINAL.ts
// Service Official Store Nasional SPWNAPP

const OFFICIAL_STORE_API =
  "https://script.google.com/macros/s/AKfycbyePD0yr_xJE2R9MeVugBzE_49DkHaSzJJBJQsl033bgiGhbu-5nFuLxFf1oy2rN0QN7w/exec";


export async function getOfficialStoreProducts(){

  const res = await fetch(
    `${OFFICIAL_STORE_API}?action=GET_OFFICIAL_STORE`,
    {
      cache:"no-store"
    }
  );

  const json = await res.json();

  return (json.products || json.data || []).map((p:any)=>({
    id:p.id || p.ID,
    sku:p.sku || p.SKU || "",
    name:p.name || p.namaProduk || "",
    shortName:p.shortName || "",
    category:p.category || p.kategori || "",
    description:p.description || "",
    price:Number(p.price || p.harga || 0),
    stock:Number(p.stock || p.stok || 0),
    imageUrl:p.imageUrl || p.fotoProduk || "",
    active:p.active !== false
  }));

}


async function postOfficial(action:string,data:any){

  const res = await fetch(
    OFFICIAL_STORE_API,
    {
      method:"POST",
      headers:{
        "Content-Type":"text/plain;charset=utf-8"
      },
      body:JSON.stringify({
        action,
        data
      })
    }
  );

  return res.json();

}


export function createOfficialProduct(data:any){

  return postOfficial(
    "CREATE_OFFICIAL_STORE",
    data
  );

}


export function updateOfficialProduct(data:any){

  return postOfficial(
    "UPDATE_OFFICIAL_STORE",
    data
  );

}


export function deleteOfficialProduct(id:string){

  return postOfficial(
    "DELETE_OFFICIAL_STORE",
    {
      id
    }
  );

}
