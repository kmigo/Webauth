from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
import json
import base64
import os
from webauthn import generate_registration_options
from webauthn.helpers.structs import PublicKeyCredentialCreationOptions,PublicKeyCredentialParameters,AttestationConveyancePreference,PublicKeyCredentialDescriptor,AuthenticatorSelectionCriteria
app = FastAPI()
import uuid
TIMEOUT = 30 * 1000 * 60
SECRET_KEY = os.environ.get("SECRET_KEY", "Exultant Walnut Bestseller")
RP_NAME = os.environ.get("RP_NAME", "Exultant Walnut Bestseller")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
def save_json(data, filename='data.json'):
    with open(filename, 'w+') as f:
        json.dump(data, f, indent=4)


def load_json():
    try:
        with open('data.json') as f:
            data = json.load(f)
        return data
    except:
        return {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Para permitir que qualquer origem acesse a API
    allow_credentials=True,
    # Para permitir todos os métodos (GET, POST, PUT, DELETE, OPTIONS, HEAD)
    allow_methods=["*"],
    allow_headers=["*"],  # Para permitir todos os headers
)

templates = Jinja2Templates(directory="templates")

# Para servir arquivos estáticos
app.mount("/static", StaticFiles(directory="public"), name="static")


@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("username.html", {"request": request})
@app.get("/password")
def page_pass(request: Request):
    return templates.TemplateResponse("password.html", {"request": request})
@app.get("/biometria")
def page_pass(request: Request):
    return templates.TemplateResponse("biometria.html", {"request": request})
@app.post("/username")
def read_item(body: dict,request: Request):
    username = body["username"]
    db = load_json()
    # Gere 32 bytes aleatórios
    random_bytes = os.urandom(32)

# Codifique os bytes em uma representação base64 segura para URL
    encoded_id = base64.urlsafe_b64encode(random_bytes).decode('utf-8')

# Crie o dicionário 'user'
    user = db.get(username, None)
    if not user:
        user = {
            'username': username,
            'id': encoded_id,
            'credentials': []
        }
        db[username] = user
        save_json(db)
    request.session['user'] = username

    return user

"""
router.post('/password', (req, res) => {
  if (!req.body.password) {
    return res.status(401).json({ error: 'Enter at least one random letter.' });
  }
  const user = Users.findByUsername(req.session.username);

  if (!user) {
    return res.status(401).json({ error: 'Enter username first.' });
  }

  req.session['signed-in'] = 'yes';
  return res.json(user);
});
"""

@app.post("/password")
def password(body:dict,request: Request):
    pwd = body["password"]
    username = request.session.get('user', None)
    db = load_json()
    user = db.get(username, None)
    if not user:
        return {"error": "Enter username first."}
    request.session['signed-in'] = 'yes'
    request.session['user'] = username
    return user

from fastapi import HTTPException
@app.post("/registerBio")
def your_endpoint_name(body: dict, request: Request):
    username = request.session.get('user', None)
    db = load_json()
    user = db.get(username, None)
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    try:
        exclude_credentials = []

        if user["credentials"]:
            for cred in user["credentials"]:
                buffer_id = base64.urlsafe_b64decode(cred["credId"])

                exclude_credentials.append(PublicKeyCredentialDescriptor(id=buffer_id,type="public-key",transports=["internal"]))

        pub_key_cred_params = []
        params = [-7, -257]

        for param in params:
            pub_key_cred_params.append({"type": "public-key", "alg": param})

        as_dict = {}  # renamed from "as" to avoid conflict with the Python keyword
        aa = body.get("authenticatorSelection", {}).get("authenticatorAttachment")
        rr = body.get("authenticatorSelection", {}).get("requireResidentKey")
        uv = body.get("authenticatorSelection", {}).get("userVerification")
        cp = body.get("attestation")
        as_flag = False
        authenticator_selection = None  # using None as equivalent to JS undefined
        attestation = "none"

        if aa and (aa in ["platform", "cross-platform"]):
            as_flag = True
            as_dict["authenticatorAttachment"] = aa
        if rr and isinstance(rr, bool):
            as_flag = True
            as_dict["requireResidentKey"] = rr
        if uv and uv in ["required", "preferred", "discouraged"]:
            as_flag = True
            as_dict["userVerification"] = uv
        if as_flag:
            authenticator_selection = AuthenticatorSelectionCriteria(**as_dict)
        if cp and cp in ["none", "indirect", "direct"]:
            attestation = cp
        uuid_v4 = uuid.uuid4()
        id = uuid_v4
        options  : PublicKeyCredentialCreationOptions= generate_registration_options(
            rp_name= RP_NAME,
            rp_id= "exultant-walnut-bestseller.glitch.me",
            user_id= user["id"],
            user_name= user["username"],
            challenge=bytearray(32),
            timeout= TIMEOUT,
            attestation=attestation,
            exclude_credentials=exclude_credentials,
            authenticator_selection=authenticator_selection
        )

        request.session["challenge"] =str(options.challenge)

        # Temporary hack until SimpleWebAuthn supports `pubKeyCredParams`
        #options["pubKeyCredParams"] = []
        options.pub_key_cred_params = []

        for param in params:

            #options.pub_key_cred_params.append({"type": "public-key", "alg": param})
            options.pub_key_cred_params.append(PublicKeyCredentialParameters(type="public-key", alg=param))
        response = options.model_dump()
        response['challenge'] = list(options.challenge)
        pub_key = response.pop('pub_key_cred_params')
        response['pubKeyCredParams'] = pub_key
        exclude_credentials_dump = response.pop('exclude_credentials')
        response['excludeCredentials'] = exclude_credentials_dump
        response.pop('authenticator_selection')
        response['authenticatorSelection'] = {
            "authenticatorAttachment":authenticator_selection.authenticator_attachment,
            "userVerification":authenticator_selection.user_verification,
            
        }
        response['user'] ={
            "id":user["id"],
            "name":user["username"],
            "displayName":user["username"],
        }
        #response = response['challenge'].decode("latin1")
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
