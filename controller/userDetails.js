const User = require('../models/userModel')


const userData = {
    getAllUser: async (req,res)=>{
        try{
            const Users = await User.find()
            res.render('userDetails',{Users})
        }catch {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    blockUser: async (req,res)=>{
        const userId=req.params.id
        try{
            await User.findByIdAndUpdate(userId,{userStatus:'blocked'})
            res.redirect('/userDetails')
        } catch {
            console.log(error);
            res.status(500).send('Internal server Error')
        }
    },
    unblockUser: async (req,res)=>{
        const userId=req.params.id
        try{
            await User.findByIdAndUpdate(userId,{userStatus:'active'})
            res.redirect('/userDetails')
        } catch {
            console.log(error);
            res.status(500).send('Internal server Error')
        }
    },
    deleteUser: async (req,res)=>{
        const userId = req.params.id
        try{
            await User.findByIdAndRemove(userId)
            res.redirect('/userDetails')
        }catch{
            console.log(error);
            res.status(500).send('Internal server error')
        }
    },
    renderEditUserForm: async (req, res) => {
        const userId = req.params.id;
        try {
            const user = await User.findById(userId);
            res.render('editUser', { user }); // Assuming you have an 'editUser' EJS template
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Update user data
    editUser: async (req, res) => {
        const userId = req.params.id;
        const { Fname, Email, PhoneNumber } = req.body;

        try {
            const user = await User.findByIdAndUpdate(userId, { Fname, Email, PhoneNumber }, { new: true });
            res.redirect('/userDetails');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },   

    searchUser: async (req,res)=>{
        const {searchQuery}=req.query
        console.log('Received search query:', searchQuery);
        try{
            const users = await User.find({
            $or:[
                { Fname: { $regex: new RegExp(searchQuery, 'i') } },
                { Email: { $regex: new RegExp(searchQuery, 'i') } },
                { PhoneNumber: { $regex: new RegExp(searchQuery, 'i') } }
            ]
            })
            res.render('searchResult',{users})
        }catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
    

}

module.exports = userData