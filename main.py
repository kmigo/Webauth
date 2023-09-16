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
from base64 import urlsafe_b64encode
from webauthn import verify_authentication_response
from webauthn.helpers.structs import AuthenticationCredential,AuthenticatorAssertionResponse
app = FastAPI()
import uuid
TIMEOUT = 30 * 1000 * 60
SECRET_KEY = os.environ.get("SECRET_KEY", "Exultant Walnut Bestseller")
RP_NAME = os.environ.get("RP_NAME", "Exultant Walnut Bestseller")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)
def save_json(data, filename='data.json'):
    with open(filename, 'w+') as f:
        json.dump(data, f, indent=4)
from pydantic import BaseModel

class WebAuthnCredential(BaseModel):
    id: str
    rawId: str
    type: str
    response: dict  # Pode ser modificado para ser mais específico se necessário


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
challenges = {}
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
    challenge = os.urandom(32)
    challenges[username] = urlsafe_b64encode(challenge).decode()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    # return {
    #     "rp": {
    #         "name": RP_NAME,
    #         "id": os.environ.get("RP_ID", request.base_url.hostname)
    #     },
    #     "user": {
    #         "id": urlsafe_b64encode(os.urandom(32)).decode(),
    #         "name": username,
    #         "displayName": username
    #     },
    #     "challenge": challenges[username],
    #     "pubKeyCredParams": [
    #         {"type": "public-key", "alg": -7},
    #         {"type": "public-key", "alg": -257}
    #     ]
    # }
    return {
          "rp": {
        "name": "webauth-python",
        "id": "webauth-python-c24178bbb68a.herokuapp.com"
    },
    "user": {
        "id": "GYlJhaiG3rxulx9_Wp5C8hdO4h-KJnAcFS1XPQPCmAg=",
        "name": "kmigo",
        "displayName": "kmigo"
    },
    "challenge": "oh6_JthluN_BkMBJLfoKJHaJJRwONWgFCt9Im6RzZ4k=",
    "pubKeyCredParams": [
        {
            "type": "public-key",
            "alg": -7
        },
        {
            "type": "public-key",
            "alg": -257
        }
    ]
    }
@app.post("/completeRegistration")
async def complete_registration(body: dict):
    # TODO: Adicione lógica de validação usando uma biblioteca de WebAuthn
    # verify_authentication_response(credential=AuthenticationCredential(
    #     id=credential.id,
    #     raw_id=credential.rawId,
    #     response=credential.response,
    # ))
    # Por enquanto, apenas retorne uma mensagem de sucesso
    return body

@app.post("/authWeb")
async def authWeb(body: dict, request: Request):
    return {
          "rp": {
        "name": "webauth-python",
        "id": "webauth-python-c24178bbb68a.herokuapp.com"
    },
    "user": {
        "id": "GYlJhaiG3rxulx9_Wp5C8hdO4h-KJnAcFS1XPQPCmAg=",
        "name": "kmigo",
        "displayName": "kmigo"
    },
    "challenge": "oh6_JthluN_BkMBJLfoKJHaJJRwONWgFCt9Im6RzZ4k=",
    "pubKeyCredParams": [
        {
            "type": "public-key",
            "alg": -7
        },
        {
            "type": "public-key",
            "alg": -257
        }
    ]
    }