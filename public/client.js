

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
  const options = await _fetch('/registerBio', opts);
  const encoder = new TextEncoder();
  let uint8Array = new Uint8Array(options.challenge);
  options.user.id = encoder.encode(options.user.id);
  options.challenge = uint8Array
    const cred = await navigator.credentials.create({
    publicKey: options,
  });
    const credential = {};
  credential.id = cred.id;
  credential.rawId = cred.rawId;
  credential.type = cred.type;
    console.log(credential);
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