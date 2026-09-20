// SPWNAPP Official Store Service

const STORE_API_URL =
  import.meta.env.VITE_STORE_API_URL ||
  "PASTE_GAS_WEB_APP_URL_DISINI";

export async function getStoreProducts(){
  const response = await fetch(
    `${STORE_API_URL}?action=GET_OFFICIAL_STORE`
  );

  const result = await response.json();
  return result.success ? result.data || [] : [];
}

export async function deleteStoreProduct(id:string){
  return fetch(STORE_API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"DELETE_OFFICIAL_STORE",
      data:{ID:id}
    })
  }).then(r=>r.json());
}
