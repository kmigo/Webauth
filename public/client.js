

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
   options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));
   options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
 
   if (options.excludeCredentials) {
     for (let cred of options.excludeCredentials) {
       cred.id = Uint8Array.from(atob(cred.id), c => c.charCodeAt(0));
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
   const verificationResponse = await _fetch('/completeRegistration',JSON.stringify(publicKeyCredential));
 
   const verificationResult = await verificationResponse.json();
   if (verificationResult.verified) {
     console.log('Registration successful');
   } else {
     console.log('Registration failed');
   }

  }
  export const authentication =async () => {

  
  }