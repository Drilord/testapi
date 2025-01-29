let otp, acsLv,succ;
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
};/*modificar despues para solo  dar acceso al container de nginx por ahora al domain *******
codigo de ejemplo:
const corsOptions = {
  origin: 'http://nginx:3000', // permite requests desde este origin
  methods: 'GET, POST, PUT, DELETE', // especifica los methods
  allowedHeaders: ['Content-Type', 'Authorization'], // y los headers
};*/
////////////////////////////////////////////////////////////
//middleware  
exp.use(cors(corsOptions)); 
exp.use(express.json());
exp.use(cookieParser());

//ruters
const rtdisc = express.Router();
exp.use('/disc', rtdisc);
const cots = express.Router();
exp.use('/cots', cots);
const vde = express.Router();
exp.use('/vende', vde);
const mdD= express.Router();
exp.use('/cmbeos',mdD)

//ruteo 
mdD.post('/newven',async (req,res)=>{
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
  const decoded = jwt.verify(token, secretKey); // Verify the token
  if(decoded.aLev==acsLv){
  const user = decoded.user; // Access the payload data
  const reqbody=req.body
  const userDt = reqbody.usr;
  const vendDt = reqbody.vend
  let adUsr,adVen;

  
  

if(userDt.vend===true){
  adVen= await addVende(vendDt);
  adUsr= await addUsr(userDt,adVen);
  succ= adUsr===true && adVen!==false? true:false;
  }else{
    adUsr= await addUsr(userDt,'');
    succ= adUsr===true? true:false;

  }
    if(succ===true){
    res.json({ message: `Se modificaron los datos.`, succ : succ }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),' ',user,`agrego al usuario: ${userDt.mail} e item: ${lastItem.modelo}`);
   }
  }
}catch (err) {
  console.error(new Date().toLocaleString('en-US'),"Token Verification Error chg:", err); // VERY important to log the error
  return res.status(401).json({ message: 'Invalid token' });
 } 
});

mdD.post('/',async (req,res)=>{
  const token = req.cookies?.auth_token;
 
  if (!token) {
       return res.status(401).json({ message: 'No token provided' });
 }
try {
 
 const decoded = jwt.verify(token, secretKey); // Verify the token
   if(decoded.aLev==acsLv){
    const user = decoded.user; // Access the payload data
    const reqbody=req.body
    const lastItem = reqbody.header;
    console.log(new Date().toLocaleString('en-US'),'LAST ITEM',lastItem);
    const dataUpdt=reqbody.uptValue;
    console.log(new Date().toLocaleString('en-US'),'data updt',dataUpdt);
    //if(lastItem.tUpt=='korUl' || lastItem.tUpt=='kolosUl'|| lastItem.tUpt=='eqBombaUl'){
    succ= await updtjson(lastItem.rangMod, lastItem.modelo, dataUpdt ,lastItem.tUpt);
    //}
    if(succ===true){
    res.json({ message: `Se modificaron los datos.`, succ : succ }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),' ',user,`Modifico Tabla: ${lastItem.tUpt} e item: ${lastItem.modelo}`);
   }else{
    res.json({ message: `No se pudo modificar los datos.`, succ : succ }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),' ',user,'No pudo modificar datos');
   }
  }else{
    console.error(new Date().toLocaleString('en-US'),' ',user,'No tiene permiso de modificar datos');
    return res.status(401).json({ message: 'No permitido para usuario' , succ : succ });
    
  }
} catch (err) {
 console.error(new Date().toLocaleString('en-US'),"Token Verification Error chg:", err); // VERY important to log the error
 return res.status(401).json({ message: 'Invalid token' });
} 
});


exp.get('/bombSol', async (req, res)=>{
    try {
        const data = await readjson(bomPath);
        //console.log(data); // despues de leer
        res.send(JSON.stringify(data)); 
      } catch (error) {
        console.error(new Date().toLocaleString('en-US'),'Error leyendo el archivo json:', error);
        res.status(500).send('Error al leer los datos');
      }
  

});
cots.get('/', async (req, res)=>{
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
      acsLv=vend?.auth ? vend?.auth  : 0;
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
      console.log(new Date().toLocaleString('en-US'),'Origin', req.originalUrl,' signed in user: ',vend?.mail);
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
    console.log(new Date().toLocaleString('en-US'), 'entered', req.originalUrl, ' signed in user:', user);
  } catch (err) {
    console.error(new Date().toLocaleString('en-US'),"Token Verification Error enemy  :", err); // VERY important to log the error
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
     else{console.log(new Date().toLocaleString('en-US'),'Error de lectura'); return;}
 
   } catch (err) {
     console.error(new Date().toLocaleString('en-US'),'Error leyendo JSON:', err);
   }
}

async function updtjson(modR, modelP, dataUpdt ,tUpdt) {
  //modR motores, modelP 1, dataUpdt {precio:300},tUPdt motoresM
  // servicios , Mano de Obra, precio:700 , servicesM
  try {
    const data = await jsf.readFile(bomPath);
    if (!data) {
      console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
      return false;
    }
    let modeltoUpt=null, modRtoUp=null, bombas;
    
    // Encontrar el dato ancla y la tabla en bomsol 
    if (tUpdt == 'korUl') {
      console.log(new Date().toLocaleString('en-US'), 'if korUl');
      bombas = data.bomSol.bombas;
      modRtoUp = bombas.find(bomF => bomF.rangMod == modR);
      modeltoUpt = modRtoUp.modelos.find(model => model.Modelo == modelP);
      console.log(new Date().toLocaleString('en-US'), 'Bombas 0 modelo 0 from data:', bombas[0].modelos[0]);
    }
    if (tUpdt == 'kolosUl') {
      console.log(new Date().toLocaleString('en-US'), 'if kolosUl');
      bombas = data.bomSol.bombasKolosal;
      modRtoUp = bombas.find(bomF => bomF.rangMod == modR);
      modeltoUpt = modRtoUp.modelos.find(model => model.Modelo == modelP);
      console.log(new Date().toLocaleString('en-US'), 'Bombas 0 modelo 0 from data:', bombas[0].modelos[0]);
    }
    if (tUpdt == 'eqBombaUl') {
      console.log(new Date().toLocaleString('en-US'), 'if eqBombaUl');
      const modelPint = parseInt(modelP);
      bombas = data.bomSol.equipamientoBomba.descarga;
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.id == modelPint);
      console.log(new Date().toLocaleString('en-US'), 'Bombas 0 modelo 0 from data:', bombas[0]);
    }
    if (tUpdt == 'cableMenu') {
      const modelPint = parseInt(modelP);
      bombas = data.bomSol.equipamientoBomba
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.calibre == modelPint);
    }
    if (tUpdt == 'motoresM') {
      const modelPint = parseInt(modelP);
      bombas = data.bomSol
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.id == modelPint);
    }
    if (tUpdt == 'servicesM') {
      bombas = data.bomSol
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.servicio == modelP);
    }
    if (tUpdt == 'gabM') {
      const modelPint = parseInt(modelP);
      bombas = data.bomSol.solar
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.id == modelPint);
    }
    if (tUpdt == 'varM') {
      const modelPint = parseInt(modelP);
      bombas = data.bomSol.solar
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.id == modelPint);
    }
    if (tUpdt == 'panM') {
      const modelPint = parseInt(modelP);
      bombas = data.bomSol.solar.paneles
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp.find(model => model.id == modelPint);
    }
    if (tUpdt == 'panelT') {
      bombas = data.bomSol.solar;
      console.log(new Date().toLocaleString('en-US'), 'tUpdt:', tUpdt);
      console.log(new Date().toLocaleString('en-US'), 'bombas:', bombas);
      console.log(new Date().toLocaleString('en-US'), 'modR:', modR);
      console.log(new Date().toLocaleString('en-US'), 'bombas.modR:', bombas[modR]);
      modRtoUp = bombas[modR];
      modeltoUpt = modRtoUp; 
    }
    if (!modRtoUp) {
      console.log(new Date().toLocaleString('en-US'), 'No se encontro el conjunto de datos');
      return false;
    } else if (!modeltoUpt) {
      console.log(new Date().toLocaleString('en-US'), 'No se encontro el item a modificar');
      return false;

    }else {
      console.log(new Date().toLocaleString('en-US'), 'Se modificara:', modeltoUpt);
      console.log(new Date().toLocaleString('en-US'), 'datos a modificar:', dataUpdt);
      const entriesArray=Object.entries(dataUpdt);
      entriesArray.forEach(([key, value]) => {
        console.log(new Date().toLocaleString('en-US'), `campo dataUpt key: ${key} value:`, value);
      if (modeltoUpt.hasOwnProperty(key)) {
        console.log(new Date().toLocaleString('en-US'), 'Se modificara el campo:', key,'de ',modeltoUpt[key],' a ',value);
        modeltoUpt[key] = value;
      }
      });
    }
    console.log(new Date().toLocaleString('en-US'), 'Bombas despues de cambios:', modRtoUp[0]);
    
    // Write the updated data back to the file
    
    try {
      await jsf.writeFile(bomPath, data);
      console.log(new Date().toLocaleString('en-US'), 'JSON file has been saved from Upt Bombas.');
      console.log(new Date().toLocaleString('en-US'), 'Archivo JSON actualizado exitosamente');
      return true;
    } catch (err) {
      console.error(new Date().toLocaleString('en-US'), 'Error writing JSON file:', err);
      return false;
    }
    
  } catch (err) {
    console.error(new Date().toLocaleString('en-US'), 'Error updating JSON:', err);
    return false;
  }
}

async function addVende(vendDt){
   try{
      const data = await jsf.readFile(bomPath);
      if (!data) {
        console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
        return false;
      }
      const vendedores= data.bomSol.vendedores;
      const newVId = vendedores.length + 1;
      const newVend = {
        id: newVId,
        ...vendDt
      };
      vendedores.push(newVend);
    try {
      await jsf.writeFile(bomPath, data);
            console.log(new Date().toLocaleString('en-US'), ' vende DB actualizada exitosamente');
      return true;
    } catch (err) {
      console.error(new Date().toLocaleString('en-US'), 'Error Guardando al Vendedor en DB:', err);
      return false;
    }

   



   }catch (err){}
   console.error(new Date().toLocaleString('en-US'), 'Error updating JSON:', err);
   return false;
   


}

async function addUsr(userDt,newId){
  try{
  vendedores.push(newVend);
  const usrData = await jsf.readFile(vendePath);
  if (!usrData) {
    console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
    return false;
  }
  const users = usrData.vendedores;
  const newUId = users.length + 1;
  const newUVend = {
    id: newUId,
    ...userDt,
    vendId:newId
  };
  users.push(newUVend);
  try {
    await jsf.writeFile(vendePath, usrData);
          console.log(new Date().toLocaleString('en-US'), ' vende DB actualizada exitosamente');
    return true;
  } catch (err) {
    console.error(new Date().toLocaleString('en-US'), 'Error Guardando al Vendedor en DB:', err);
    return false;
  }

}catch(err){
  console.error(new Date().toLocaleString('en-US'), 'Error updating JSON:', err);
   return false;
}  

}
exp.listen(PORT, ()=>{
    console.log(new Date().toLocaleString('en-US'),'Servidor escuchando en: ', PORT)
});
