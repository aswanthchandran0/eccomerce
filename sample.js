const express = require('express')


const app = express()

app.use((req,res)=>{
      let {num1,num2} = req.params

      console.log(num1)
    res.send(num1+num2)
})

app.listen(3000,()=>{
    console.log("server running")
})