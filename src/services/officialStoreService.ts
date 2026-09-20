// SPWNAPP Official Store Service
// Khusus Merchandise Nasional Saka Pariwisata

const OFFICIAL_STORE_API =
"https://script.google.com/macros/s/AKfycbyePD0yr_xJE2R9MeVugBzE_49DkHaSzJJBJQsl033bgiGhbu-5nFuLxFf1oy2rN0QN7w/exec";


export async function getOfficialStoreProducts(){

 try{

  const response = await fetch(
   `${OFFICIAL_STORE_API}?action=GET_OFFICIAL_STORE`,
   {cache:"no-store"}
  );

  const result = await response.json();

  return result.success ? (result.data || []) : [];

 }catch(error){

  console.error("Official Store Error",error);
  return [];

 }

}
