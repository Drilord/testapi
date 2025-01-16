let otp, acsLv;
const express = require('express');
const jsf = require('jsonfile')
const exp = express();
const cors = require('cors');
const path = require('path'); 
const vendePath = path.join(__dirname, '..', 'dt', 'vende.json');
const bomPath = path.join(__dirname, '..', 'dt', 'datos.json');
const cotsPath = path.join(__dirname, '..', 'dt', 'cots.json');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
const cookieParser = require('cookie-parser');
const corsOptions = {
  origin: 'https://localhost', // Only allow requests from your frontend
  credentials: true, // Important for cookies
};
exp.use(cors(corsOptions)); /*modificar despues para solo  dar acceso al container de nginx por ahora al domain *******
codigo de ejemplo:
const corsOptions = {
  origin: 'http://nginx:3000', // permite requests desde este origin
  methods: 'GET, POST, PUT, DELETE', // especifica los methods
  allowedHeaders: ['Content-Type', 'Authorization'], // y los headers
};

*/
//middleware  
exp.use(express.json());
exp.use(cookieParser());

//ruters
const rtdisc = express.Router();
exp.use('/disc', rtdisc);
const cots = express.Router();
exp.use('/cots', cots);
const vde = express.Router();
exp.use('/vende', vde);
//ruteo
exp.get('/bombSol', async (req, res)=>{
    console.log(req.url);
    try {
        const data = await readjson(bomPath);
        //console.log(data); // despues de leer
        res.send(JSON.stringify(data)); 
      } catch (error) {
        console.error('Error leyendo el archivo json:', error);
        res.status(500).send('Error al leer los datos');
      }
  

});
cots.get('/', async (req, res)=>{
    console.log(req.url);
    try {
        const data = await readjson(cotsPath)
        //console.log(data); // despues de leer
        res.send(JSON.stringify(data)); 
      } catch (error) {
        console.error('Error leyendo el archivo json:', error);
        res.status(500).send('Error al leer los datos');
      }
});

vde.post('/', async (req, res)=>{
    const login =req.body;
    
    const pw=login?.p;
    
    const usr=login?.u;
    
    try {
      const data = await readjson(vendePath)
      const vend= data.vendedores.find(vendedor =>{
         return vendedor.mail === usr && vendedor.pw === pw
      });
      let authid = (vend?.vendId ? vend?.vendId  : 0);
      let authLevel = (vend?.auth ? vend?.auth  : 0);
      if (typeof vend === 'undefined'){
        console.log(" vend array invalid");
        const token='invalid';
        const auth= {token:token,id:null,authL:null};
        res.send(JSON.stringify(auth)); 
         
      }else{
        const payload = {
          user:vend?.mail, aLev:authLevel, id:authid  
        };
      const webtoken = jwt.sign(payload, secretKey, { expiresIn: '12h' });
      res.cookie('auth_token', webtoken, {
        httpOnly: true, 
        secure: true, // este pedo debe estar en false para probar en http:
        sameSite: 'Strict', 
       // maxAge: 12 * 60 * 60 * 1000, // 12 hours in milliseconds (alternative to expires)
        path: '/', // Set the cookie path (usually '/' for the whole site)
      });
      console.log(new Date(),' signed in user: ',vend?.mail);
      const token="valid";
      const auth= {token:token,id:authid,authL:authLevel};
      res.send(JSON.stringify(auth)); 
      
    }  
    } catch (error) {
      console.error('Error leyendo el archivo json:', error);
      res.status(500).send('Error al leer los datos');
    } 
});

vde.get('/amoen', async (req, res)=>{  
  console.log("Request to /api/vende/amoen");
    const token = req.cookies?.auth_token;
     if (!token) {
          return res.status(401).json({ message: 'No token provided' });
    }
  try {
    
    const decoded = jwt.verify(token, secretKey); // Verify the token
    // Token is valid! 'decoded' contains the payload
    
    const user = decoded.user; // Access the payload data
    res.json({ message: `Welcome ${user}! This is protected data.`, userData: decoded }); // Send data back to the client
    console.log(new Date(),'entered signed in user:',user);
  } catch (err) {
    console.error("Token Verification Error:", err); // VERY important to log the error
    return res.status(401).json({ message: 'Invalid token' });
  }
  //res.send(JSON.stringify(randAuth)); 
  
});

rtdisc.get('/', async (req, res)=>{
  otp = Math.random().toString(36).slice(2, 10);
  const randAuth={otp:otp};
  //console.log('otp: ',otp);
  res.send(JSON.stringify(randAuth)); 
  
});
rtdisc.get('/:pwd', async (req, res)=>{
    const pw=req.params.pwd;
    console.log('otp generado');
    if (pw === otp){
      otp=Math.random().toString(36).slice(2, 10);
      const auth= {token:'valid'};
      res.send(JSON.stringify(auth));
       
    }else{
    const auth= {token:'invalid'};
    res.send(JSON.stringify(auth)); 
  }  
  
});
 const PORT = process.env.PORT|| 3000;
 

 async function readjson(filePath) {
 try {
     const data = await jsf.readFile(filePath);
         if(data){ return data;}
     else{console.log('Error de lectura'); return;}
 
   } catch (err) {
     console.error('Error leyendo JSON:', err);
   }
}

exp.listen(PORT, ()=>{
    console.log('Servidor escuchando en: ', PORT)
});
