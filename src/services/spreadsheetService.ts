/**
 * spreadsheetService.ts
 * SPWN API Service Connector
 * Login melalui Vercel API Route (/api/auth/login)
 * Tidak melakukan autentikasi melalui Spreadsheet Anggota
 */

class SpreadsheetService {

  private async spwnRequest(
    action: string,
    payload: Record<string, any> = {}
  ): Promise<any> {

    const response = await fetch("/api/spwn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    });

    return await response.json();
  }


  public async loginUser(
    email: string,
    password: string
  ) {

    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );


    return await response.json();

  }


  public async getMemberStatistic(){

    return this.spwnRequest(
      "member_statistic"
    );

  }


  public async getMemberProfile(
    memberId:string
  ){

    return this.spwnRequest(
      "member_profile",
      {
        memberId
      }
    );

  }


  public async verifyKTA(
    verifyId:string
  ){

    return this.spwnRequest(
      "verify_kta",
      {
        verifyId
      }
    );

  }


  public async generateKTA(
    memberId:string,
    templateId?:string
  ){

    return this.spwnRequest(
      "kta_generate",
      {
        memberId,
        templateId
      }
    );

  }

}


export const spreadsheetService =
  new SpreadsheetService();
