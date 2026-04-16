class APIfeatures{

constructor(query, querystring){
   this.query=query;
   this.querystring=querystring;}

  //filter 1 -> (remove the excluded fields) 
  filter(){
      
    let queryObj={...this.querystring}
    const excludedField=[`sort`,`limit`,`page`,`fields`] 
    excludedField.forEach(el => {delete queryObj[el]});
    
    
   let querySTR = JSON.stringify(queryObj);
   querySTR=querySTR.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`)

  this.query=this.query.find(JSON.parse(querySTR));

    return this;
  }

  //sort
  sort(){
    if(this.querystring.sort){
    const sortby= this.querystring.sort.split(',').join(` `);
    this.query=this.query.sort(sortby);
  
  } 
  
    return this;
  }
  
  // field limit
  limitFields(){
  if(this.querystring.fields){
  const f= this.querystring.fields.split(`,`).join(` `);
  this.query = this.query.select(f);
  } 

    return this;
  }

  //paginate
    paginate() {
  const page = Number(this.querystring.page) || 1;
  const limit = Number(this.querystring.limit) || 10;

  const skip = (page - 1) * limit;

 if(this.querystring.page){ 
  this.query = this.query.skip(skip).limit(limit);}

  return this;
}

}

module.exports= APIfeatures