

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
  
  const base64Url = (str) => {
    let encodedStr = "your_base64_string";
const padding = "=".repeat((4 - (encodedStr.length % 4)) % 4);
encodedStr += padding;
const decodedStr = atob(encodedStr);
return decodedStr;
  }
  export const registerCredential = async () => {
  // const options = await _fetch('/registerBio', {});
  // const encoder = new TextEncoder();
  // let uint8Array = new Uint8Array(options.challenge);
  // options.user.id = encoder.encode(options.user.id);
  // options.challenge = uint8Array
  //   const cred = await navigator.credentials.create({
  //   publicKey: options,
  // });
  // const credential = {};
  // credential.id = cred.id;
  // credential.rawId = encoder.e(cred.rawId);
  // credential.type = cred.type;
  
  // if (cred.response) {
  //   const clientDataJSON =
  //     base64url.encode(cred.response.clientDataJSON);
  //   const attestationObject =
  //     base64url.encode(cred.response.attestationObject);
  //   credential.response = {
  //     clientDataJSON,
  //     attestationObject,
  //   };
  // }
  // console.log(credential);
  //   localStorage.setItem(`credId`, credential.id);
   // Solicitar opções de registro ao servidor
   const options = await _fetch('/registerBio',{});

 
   // Ajustar as opções para o formato correto
   options.user.id = Uint8Array.from(base64Url(options.user.id), c => c.charCodeAt(0));
   options.challenge = Uint8Array.from(base64Url(options.challenge), c => c.charCodeAt(0));
 
   if (options.excludeCredentials) {
     for (let cred of options.excludeCredentials) {
       cred.id = Uint8Array.from(base64Url(cred.id), c => c.charCodeAt(0));
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
 
   // Enviar a credencial ao servidor para verificação e armazenamento
   const verificationResult = await _fetch('/completeRegistration',JSON.stringify(publicKeyCredential));
 

   if (verificationResult.verified) {
     console.log('Registration successful');
   } else {
     console.log('Registration failed');
   }

  }
  export const authentication =async () => {
// Solicitar opções de autenticação ao servidor
const response = await fetch('/webauthn/startAuthentication');
const options = await response.json();

// Ajustar as opções para o formato correto
options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));

if (options.allowCredentials) {
  for (let cred of options.allowCredentials) {
    cred.id = Uint8Array.from(atob(cred.id), c => c.charCodeAt(0));
  }
}

// Solicitar ao navegador para usar uma credencial existente
const credential = await navigator.credentials.get({ publicKey: options });

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
const verificationResponse = await fetch('/webauthn/finishAuthentication', {
  method: 'POST',
  body: JSON.stringify(publicKeyCredential),
  headers: {
    'Content-Type': 'application/json'
  }
});

const verificationResult = await verificationResponse.json();
if (verificationResult.verified) {
  console.log('Authentication successful');
} else {
  console.log('Authentication failed');
}
  
  }