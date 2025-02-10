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
mdD.delete('/newven/:uid/:vid',async (req,res)=>{
  const vtgtId = req.params.vid
  const utgtId = req.params.uid;
  const token = req.cookies?.auth_token;
  let delVen
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  } 
  try {
    const decoded = jwt.verify(token, secretKey); // Verify the token
    if(decoded.aLev==3){
    const user = decoded.user; // Access the payload data
    const delUsr= await delUser(utgtId);
    if(vtgtId!='none'){
    delVen= await delVend(vtgtId);
    }else{delVen=true;}
    succ= delUsr===true && delVen===true? true:false;
    
      if(succ===true){
      res.json({ message: `Se elimino el usuario.`, succ : succ }); // Send data back to the client
      console.log(new Date().toLocaleString('en-US'),
                  ' ',
                  user,
                  `elimino el usuario: ${utgtId} y vendedor: ${vtgtId}`);
     }else{
      res.status(400).json({ message: `Error al eliminar usuario.`, succ : succ }); // Send data back to the client
      console.log(new Date().toLocaleString('en-US'),`Error al eliminar el usuario. `);
     }
    }else{
      console.log(new Date().toLocaleString('en-US'),`${user} intento eliminar un usuario sin permiso. `);
      return res.status(401).json({ message: 'El Usuario no esta autorizado' });
    }
  } catch (err) {
    console.error(new Date().toLocaleString('en-US'), "Error eliminando usuario y vendedor:", err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});
mdD.put('/newven/:vid',async (req,res)=>{
  let mod;
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, secretKey); // Verify the token
    if(decoded.aLev==3){
    const user = decoded.user; // Access the payload data
    const reqbody=req.body
    const userDt = reqbody.usr;
    const vendDt = reqbody.vend;
    const flag = reqbody.flag;
    let adUsr,adVen,delVen;
    let vtgtId = req.params.vid;
    const utgtId = userDt.id;
    if(vtgtId==='assign'){
      mod = false
      vtgtId = '';
    }else{  
      mod = true;
    }
  if(flag===true){
    adVen= await addVende(vendDt,mod,vtgtId);
    }
    else if(flag===false){
      if(userDt.vendId==='delete'){
        delVen= await delVend(vendDt.id);
        if(delVen===true){
          console.log(new Date().toLocaleString('en-US'),'Vendedor eliminado por:',user);
        }else{
          res.send(400).json({ message: `Error al eliminar vendedor.`, succ : false }); // Send data back to the client
          throw new Error(new Date().toLocaleString('en-US'),'Error al eliminar vendedor');
        }
      } 
    }  
    adUsr= await addUsr(userDt,utgtId,true,delVen?'':adVen);
    succ= adUsr===true && adVen!==null? true:false;
  
    
      if(succ===true){
      res.json({ message: `Se modifico el usuario.`, succ : succ }); // Send data back to the client
      console.log(new Date().toLocaleString('en-US'),
                  ' ',
                  user,
                  `modifico el usuario: ${userDt?.mail} ${flag===true?` vendedor: ${vendDt.nombre}`:''}`);
     }else{
      res.status(400).json({ message: `Error al modificar usuario.`, succ : succ }); // Send data back to the client
      console.log(new Date().toLocaleString('en-US'),`Error al modificar el usuario. `);
     }
    }else{
      console.log(new Date().toLocaleString('en-US'),`${user} intento modificar un usuario sin permiso. `);
      return res.status(401).json({ message: 'El Usuario no esta autorizado' });
    }
  }catch (err) {
    console.error(new Date().toLocaleString('en-US'),"Token Verification Error chg user:", err); // VERY important to log the error
    return res.status(401).json({ message: 'Invalid token' });
   } 



});

mdD.post('/newven',async (req,res)=>{
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
  const decoded = jwt.verify(token, secretKey); // Verify the token
  if(decoded.aLev==3){
  const user = decoded.user; // Access the payload data
  const reqbody=req.body
  const userDt = reqbody.usr;
  const vendDt = reqbody.vend;
  const flag = reqbody.flag;
  let adUsr,adVen;

if(flag===true){
  adVen= await addVende(vendDt);

  adUsr= await addUsr(userDt,adVen);
  succ= adUsr===true && adVen!==null? true:false;
  }else{
    adUsr= await addUsr(userDt,'');
    succ= adUsr===true? true:false;

  }
    if(succ===true){
    res.json({ message: `Se agrego al usuario.`, succ : succ }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),
                ' ',
                user,
                `agrego al usuario: ${userDt?.mail} ${flag===true?` vendedor: ${reqbody?.vend?.nombre}`:''}`);
   }else{
    res.status(400).json({ message: `Error al agregar usuario.`, succ : succ }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),`Error al agregar el usuario. `);
   }
  }else{
    console.log(new Date().toLocaleString('en-US'),`${user} intento agregar un usuario sin permiso. `);
    return res.status(401).json({ message: 'El Usuario no esta autorizado' });
  }
}catch (err) {
  console.error(new Date().toLocaleString('en-US'),"Token Verification Error chg:", err); // VERY important to log the error
  return res.status(401).json({ message: 'Invalid token' });
 } 
});

mdD.put('/',async (req,res)=>{
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

mdD.get('/gtus', async (req, res)=>{
  const token = req.cookies?.auth_token;
 
  if (!token) {
       return res.status(401).json({ message: 'No token provided' });
 }
  try {
    const decoded = jwt.verify(token, secretKey); // Verify the token
    const user = decoded.user;
   if(decoded.aLev==3){
    
    const data = await readjson(vendePath);
    const usArr=data.vendedores;

        res.send(JSON.stringify(usArr)); 

      }else{
        console.error(new Date().toLocaleString('en-US'),' ',user,'No tiene permiso de consultar datos de usuario');
        return res.status(401).json({ message: 'No permitido para usuario' , succ : succ });
        
      }     
  } catch (error) {
    console.error(new Date().toLocaleString('en-US'),'Error leyendo el archivo json:', error);
    res.status(500).send('Error al leer los datos');
  }
  


});

exp.get('/bombSol', async (req, res)=>{
  const token = req.cookies?.auth_token;
 
  if (!token) {
       return res.status(401).json({ message: 'No token provided' });
 }
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
cots.post('/new',async (req,res)=>{
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
  const decoded = jwt.verify(token, secretKey); // Verify the token
  
  const user = decoded.user; // Access the payload data
  const reqbody=req.body
  const newCot= await newcot(reqbody);
  if(newCot){
    res.json({ message: `Se agrego la cotizacion.`, succ : true }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),' ',user,`agrego la cotizacion: ${reqbody?.id}`);
    }else{
    res.status(400).json({ message: `Error al agregar cotizacion.`, succ : false }); // Send data back to the client
    console.log(new Date().toLocaleString('en-US'),`Error al agregar la cotizacion. `);
    }
  }catch (err) {
    console.error(new Date().toLocaleString('en-US'),"Token Verification Error chg:", err); // VERY important to log the error
    return res.status(401).json({ message: 'Invalid token' });
   } 

});


vde.post('/', async (req, res)=>{
    const login =req.body;
    
    const pw=login?.p;
    
    const usr=login?.u;
    
    try {
      const data = await readjson(vendePath)
      const vend= data.vendedores.find(vendedor =>{
      const hashedPw = crypto.createHash('sha256').update(pw).digest('hex');
      return vendedor.mail === usr && vendedor.pw === hashedPw;
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
 
async function newcot(cot){
  try { 
    const data = await jsf.readFile(cotsPath);
    if (!data) {
      console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
      return false;
    }
    const cots = data.cots;
    const newCot = {
      ...cot
    };
    cots.push(newCot);
    try {
      await jsf.writeFile(cotsPath, data);
      console.log(new Date().toLocaleString('en-US'), 'Cotizacion agregada a DB exitosamente');
      return true;
    } catch (err) {
      console.error(new Date().toLocaleString('en-US'), 'Error Guardando la Cotizacion en DB:', err);
      return false;
    }
  } catch (err) {
    console.error(new Date().toLocaleString('en-US'), 'Error updating JSON:', err);
    return false;
  }
}
 

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


async function delVend(vtgtId){
try{
   const data = await jsf.readFile(bomPath);
  if (!data) {
    console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
    return false;
  }
  const vendedores= data.bomSol.vendedores;
  const vendId = vtgtId;
  const vendMod = vendedores.find(vendedor => parseInt(vendedor.id) === parseInt(vendId));
  if (!vendMod) {
    console.log(new Date().toLocaleString('en-US'), 'No se encontro el vendedor a eliminar');
    return false;
  }
  const vendIndex = vendedores.findIndex(vendedor => parseInt(vendedor.id) === parseInt(vendId));
  vendedores.splice(vendIndex, 1);
  try {
    await jsf.writeFile(bomPath, data);
    console.log(new Date().toLocaleString('en-US'), `Vendedor ${vendMod.nombre} id:${vendMod.id} eliminado de DB exitosamente`);
    return true;
  } catch (err) {
    console.error(new Date().toLocaleString('en-US'), 'Error Guardando al Vendedor en DB:', err);
    return false;
  }

}catch(err){
  console.error(new Date().toLocaleString('en-US'), 'Error deleting Vendedor JSON:', err);
  return false;
}

  
}
async function delUser(utgtId){
  try{
    const usrData = await jsf.readFile(vendePath);
    if (!usrData) {
      console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
      return false;
    }
    const users = usrData.vendedores;
    const usrId = utgtId;
    console.log(new Date().toLocaleString('en-US'), 'usrId:', usrId);
    const usrMod = users.find(usr => parseInt(usr.id) === parseInt(usrId));
    console.log(new Date().toLocaleString('en-US'), 'usrMod:', usrMod);
    if (!usrMod) {
      console.log(new Date().toLocaleString('en-US'), 'No se encontro el usuario a eliminar');
      return false;
    }
    const usrIndex = users.findIndex(usr => parseInt(usr.id) === parseInt(usrId));
    users.splice(usrIndex, 1);
    try {
      await jsf.writeFile(vendePath, usrData);
      console.log(new Date().toLocaleString('en-US'), `Usuario:${usrMod.mail} id:${usrMod.id}  eliminado de DB exitosamente`);
      return true;
    } catch (err) {
      console.error(new Date().toLocaleString('en-US'), 'Error Guardando al Usuario en DB:', err);
      return false;
    }
  
  }catch(err){
    console.error(new Date().toLocaleString('en-US'), 'Error deleting Usuario JSON:', err);
    return false;
  }

}

//solo el id ,tru,undefined
async function addVende(vendDt,modFlg,idV){
  let newVId;
   try{
      const data = await jsf.readFile(bomPath);
      if (!data) {
        console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
        return null;
      }
      const vendedores= data.bomSol.vendedores;
      const vendId = idV;
      const vendMod = vendedores.find(vendedor => parseInt(vendedor.id) === parseInt(vendId));
      if(!vendMod){modFlg=false;}
      if(!modFlg){
      newVId = vendedores.length + 1;
      console.log(new Date().toLocaleString('en-US'), ' leght newVId:', newVId);
      const existingVend = vendedores.find(vendedor => parseInt(vendedor.id) === newVId);
      console.log(new Date().toLocaleString('en-US'), 'existingVend:', existingVend);
      if (existingVend) {
        const vendedorIds = vendedores.map(vendedor => parseInt(vendedor.id));
        console.log(new Date().toLocaleString('en-US'), 'vendedorIds:', vendedorIds);
        const missingId = vendedorIds.sort((a, b) => a - b).find((id, index, array) => id + 1 !== array[index + 1]) + 1 || vendedores.length + 1;
        console.log(new Date().toLocaleString('en-US'), 'missingId:', missingId);
        newVId = missingId;
      }
       
      const newVend = {
        id: String(newVId),
        ...vendDt,
        id: String(newVId) // Ensure the id is overwritten
      };
      vendedores.push(newVend);
    }else if(modFlg===true){
      
      
      const entriesArray=Object.entries(vendDt);
      entriesArray.forEach(([key, value]) => {
        console.log(new Date().toLocaleString('en-US'), `campo vendDt key: ${key} value:`, value);
      if (value!=vendMod[key]) {
        console.log(new Date().toLocaleString('en-US'), 'Se modificara el campo:', key,'de ',vendMod[key],' a ',value);
        vendMod[key] = value;
      }
      });
      newVId=vendDt.id
    }
    try {
      await jsf.writeFile(bomPath, data);
            console.log(new Date().toLocaleString('en-US'), ' Vendedor agregado a DB exitosamente');
      return String(newVId);
    } catch (err) {
      console.error(new Date().toLocaleString('en-US'), 'Error Guardando al Vendedor en DB:', err);
      return null;
    }
   }catch (err){}
   console.error(new Date().toLocaleString('en-US'), 'Error updating JSON:', err);
   return false;
}
                      //changes usid true ''
async function addUsr(userDt,newId,modFlg,vIMod){
  try{
  const usrData = await jsf.readFile(vendePath);
  if (!usrData) {
    console.log(new Date().toLocaleString('en-US'), 'No se encontro el archivo JSON');
    return false;
  }
  const users = usrData.vendedores;
  if(!modFlg){
  let newUId = users.length + 1;
  const existingUsr = users.find(vendedor => parseInt(vendedor.id) === newUId);
      if (existingUsr) {
        const usrIds = users.map(vendedor => parseInt(vendedor.id));
        const missingId = usrIds.sort((a, b) => a - b).find((id, index, array) => id + 1 !== array[index + 1]) + 1 || users.length + 1;
        newUId = missingId;
      }
      userDt.pw = crypto.createHash('sha256').update(userDt.pw).digest('hex')
  const newUVend = {
    id: String(newUId),
    ...userDt,
    vendId:newId
  };
  users.push(newUVend);
}else if(modFlg===true){
  const usrId = newId; 
  const usrMod = users.find(usr => parseInt(usr.id) === parseInt(usrId));
  if (!usrMod) {
    console.log(new Date().toLocaleString('en-US'), 'No se encontro el vendedor a modificar');
    return null;
  }
  const entriesArray=Object.entries(userDt);
  entriesArray.forEach(([key, value]) => {
    console.log(new Date().toLocaleString('en-US'), `campo vendDt key: ${key} value:`, value);
  if (value!=usrMod[key]) {
    if (key === 'pw') {
      value = crypto.createHash('sha256').update(value).digest('hex');
    }
    console.log(new Date().toLocaleString('en-US'), 'Se modificara el campo:', key,'de ',usrMod[key],' a ',value);
    usrMod[key] = value;
  }
  });
  usrMod.vendId=vIMod;
}

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
const PORT = process.env.PORT|| 3000;
  
exp.listen(PORT, ()=>{
    console.log(new Date().toLocaleString('en-US'),'Servidor escuchando en: ', PORT)
});
