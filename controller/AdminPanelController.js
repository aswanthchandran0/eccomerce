

const AdminPanel = {
    logout : async(req,res)=>{
        try{
             await req.session.destroy() 
             res.redirect('/adminLogin');
        }catch(errors) {
            console.error('Error destroying session:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = {AdminPanel}