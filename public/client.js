

export const _fetch = async (path, payload = '') => {
    const headers = {};

      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(payload);

    const res = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
    },
      body: payload,
    });
    if (res.status === 200) {
      // Server authentication succeeded
      return res.json();
    } else {
      // Server authentication failed
      const result = await res.json();
      throw result.error;
    }
  };
  
  export const registerCredential = async () => {
  const opts = {
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      requireResidentKey: false
    }
  };

  const options = await _fetch('/registerBio', opts);
  const encoder = new TextEncoder();
  let uint8Array = new Uint8Array(options.challenge);

//     options.user.id = base64url.decode(options.user.id);
//   options.challenge = base64url.decode(options.challenge);
  options.user.id = encoder.encode(options.user.id);
  options.challenge = uint8Array

  if (options.excludeCredentials) {
    for (let cred of options.excludeCredentials) {
    //   cred.id = base64url.decode(cred.id);
      cred.id = cred.id;
    }
  }
  const publicKeyCredentialCreationOptions = {
    challenge: options.challenge,
    rp: {
      name: "eaglesoftwaremarcos",
      id: "eaglesoftware.com.br",
    },
    user: {
      id: new Uint8Array(16), // Identificador único do usuário
      name: "Marcos Paulo", // Nome do usuário
      displayName: "Machadinho", // Nome a ser exibido
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    
    timeout: 60000,
  };
  console.log(window.location.hostname)
    const cred = await navigator.credentials.create({
    publicKey: options,
  });
    const credential = {};
  credential.id = cred.id;
  credential.rawId = cred.rawId;
  credential.type = cred.type;
  
  if (cred.response) {
    const clientDataJSON =
      cred.response.clientDataJSON;
    const attestationObject =
      cred.response.attestationObject;
    credential.response = {
      clientDataJSON,
      attestationObject,
    };
  }
    localStorage.setItem(`credId`, credential.id);
    //return await _fetch('/auth/registerResponse' , credential);
  };