
export function generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function layoutLetters(code: string) {
    return (`<!DOCTYPE html>
   <html lang="en">
   
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Ваш код доступа</title>
   </head>
   
   <body style="  font-family: Arial, sans-serif;
   background-color: #f4f4f4;
   margin: 0;
   padding: 0">
       <div class="container" style=" max-width: 600px;
       margin: 0 auto;
       padding: 20px;
       background-color: #fff;
       border-radius: 5px;
       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
       
           <h1 style="color: #000;">Код доступа:</h1>
           <div class="" style="   color: #666;">
               <p style="text-align: center;font-size: 62px;"><b>${code}</b></p>
               <p style="font-size: 12px;">С уважением, команда FindME!</p>
           </div>
       </div>
   </body>
   
   </html>`)
}
export function forgotPasswordTemplate(code: string) {
    return (`<!DOCTYPE html>
   <html lang="en">
   
   <head>
       <meta charset="UTF-8">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Смена пароля!</title>
   </head>
   
   <body style="  font-family: Arial, sans-serif;
   background-color: #f4f4f4;
   margin: 0;
   padding: 0">
       <div class="container" style=" max-width: 600px;
       margin: 0 auto;
       padding: 20px;
       background-color: #fff;
       border-radius: 5px;
       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
       
           <h1 style="color: #000;">Ваш новый пароль:</h1>
           <div class="" style="   color: #666;">
               <p style="text-align: center;font-size: 62px;"><b>${code}</b></p>
               <p style="font-size: 12px;">С уважением, команда FindME!</p>
           </div>
       </div>
   </body>
   
   </html>`)
}

let numbers = [1,2,3,4,5,6,7,8,9,10]
let alphabet =  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
let  signs = ['!','@',"#","$","%","^","&","*", '?']

export function generatePassword(min: number, max: number) {
   let password:string = ''
   let allCharecters = [...numbers, ...alphabet, ...signs]
    for (let i = 0; i < max; i++) {
        const randomIndex = generateRandomNumber(0, allCharecters.length)
        password += allCharecters[randomIndex]

    }
    return password
}


