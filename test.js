server.post("/:dept/:sub/:unit/new_topic",async(req,res)=>{

    try{
      sub = req.params.sub;
      const unit = parseInt(req.params.unit);
      const data = req.body.topic;
  
      const dept_sem_collection = await axios.get(`${domain}${dept}`);
      const subjects = dept_sem_collection.data;
      let result = subject_join(subjects,sub);
      
      if(result && unit>=1 && unit <=5 ){
      const add_topic=await axios.post(`${domain}${dept}/${sub}/${unit}`,{
          topic:data
      },
      res.redirect((`/${dept}/${sub}/${unit}`))
  )}else{
      res.send("page not found");
  }
  }catch(err){
      res.send(err);
  }
  })