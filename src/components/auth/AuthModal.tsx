// PATCH AuthModal.tsx
// Ganti fungsi handleLogin lama dengan fungsi ini

const handleLogin = async (
  e: React.FormEvent
) => {

  e.preventDefault();

  setLoginError('');
  setIsLoading(true);

  const ident = loginIdentifier.trim();
  const pass = loginPassword;

  console.log("[LOGIN FORM]", {
    ident,
    passwordLength: pass.length
  });

  if (!ident || !pass) {
    setIsLoading(false);
    setLoginError(
      'Nama pengguna dan kata sandi wajib diisi.'
    );
    return;
  }

  try {

    const result =
      await spreadsheetService.loginUser(
        ident,
        pass
      );

    console.log(
      "[LOGIN RESPONSE]",
      result
    );

    const loginUser =
      result?.user ||
      result?.data?.user ||
      result?.data;

    if (
      !result ||
      !result.success ||
      !loginUser
    ) {
      throw new Error(
        result?.message ||
        "Login gagal"
      );
    }

    localStorage.setItem(
      "spwn_user",
      JSON.stringify(loginUser)
    );

    storage.setCurrentUser(
      loginUser
    );

    onLoginSuccess(
      loginUser
    );

    onClose();

  } catch(error:any) {

    console.error(
      "[AUTH LOGIN ERROR]",
      error
    );

    setLoginError(
      error.message ||
      "Login gagal"
    );

  } finally {

    setIsLoading(false);

  }

};

// Hapus blok lama yang berisi:
// const GAS_URL = 'https://script.google.com/...'
// fetch(GAS_URL, ...)
