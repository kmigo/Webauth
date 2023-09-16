

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
  function base64UrlToBase64(base64Url) {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return base64;
}
function safeAtob(base64) {
  base64 = base64UrlToBase64(base64);
  base64 = base64.trim().replace(/[^a-zA-Z0-9+/=]/g, "");
  while (base64.length % 4) {
      base64 += "=";
  }
  try {
      return atob(base64);
  } catch (e) {
      console.error("Failed to decode base64 string.", e);
      return null;
  }
}


  export const registerCredential = async () => {
 
   const options = await _fetch('/registerBio',{});

 
   // Ajustar as opções para o formato correto
   options.user.id = Uint8Array.from(safeAtob(options.user.id), c => c.charCodeAt(0));
   options.challenge = Uint8Array.from(safeAtob(options.challenge), c => c.charCodeAt(0));
 
   if (options.excludeCredentials) {
     for (let cred of options.excludeCredentials) {
       cred.id = Uint8Array.from(safeAtob(cred.id), c => c.charCodeAt(0));
     }
   }
 
   // Solicitar ao navegador a criação de uma nova credencial
   const credential = await navigator.credentials.create({ publicKey: options });
 
   // Ajustar a credencial para enviar ao servidor
   const publicKeyCredential = {
     id: credential.id,
     type: credential.type,
     rawId: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.rawId))),
     response: {
       clientDataJSON: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.response.clientDataJSON))),
       attestationObject: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.response.attestationObject)))
     }
   };
   localStorage.setItem('credId',credential.id);
   // Enviar a credencial ao servidor para verificação e armazenamento
  //  const verificationResult = await _fetch('/completeRegistration',publicKeyCredential);
  //  console.log(verificationResult);

  //  if (verificationResult.verified) {
  //    console.log('Registration successful');
  //  } else {
  //    console.log('Registration failed');
  //  }

  }
  export const authentication =async () => {
// Solicitar opções de autenticação ao servidor
const options = await fetch('/authWeb');


// Ajustar as opções para o formato correto
options.challenge = Uint8Array.from(safeAtob(options.challenge), c => c.charCodeAt(0));

if (options.allowCredentials) {
  for (let cred of options.allowCredentials) {
    cred.id = Uint8Array.from(safeAtob(cred.id), c => c.charCodeAt(0));
  }
}

// Solicitar ao navegador para usar uma credencial existente
const credential = await navigator.credentials.get({ publicKey: options });
alert('logado');
// Ajustar a credencial para enviar ao servidor
const publicKeyCredential = {
  id: credential.id,
  type: credential.type,
  rawId: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.rawId))),
  response: {
    clientDataJSON: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.response.clientDataJSON))),
    authenticatorData: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.response.authenticatorData))),
    signature: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.response.signature))),
    userHandle: btoa(String.fromCharCode.apply(null, new Uint8Array(credential.response.userHandle)))
  }
};

// Enviar a credencial ao servidor para verificação
// const verificationResult = await fetch('/webauthn/finishAuthentication', {
//   method: 'POST',
//   body: JSON.stringify(publicKeyCredential),
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });


// if (verificationResult.verified) {
//   console.log('Authentication successful');
// } else {
//   console.log('Authentication failed');
// }
  
  }