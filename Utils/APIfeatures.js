class APIfeatures{

constructor(query, querystring){
   this.query=query;
   this.querystring=querystring;}

  filter(){
    let queryObj={...this.querystring}
    const excludedField=[`sort`,`limit`,`page`,`fields`] 
    excludedField.forEach(el => {delete queryObj[el]});

    queryObj = stripDollarKeys(queryObj);
    
   let querySTR = JSON.stringify(queryObj);
   querySTR=querySTR.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`)

  this.query=this.query.find(JSON.parse(querySTR));

    return this;
  }

  sort(){
    if(this.querystring.sort){
      const fields = String(this.querystring.sort)
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
      const allowed = fields.every(field => /^-?[a-zA-Z][a-zA-Z0-9]*$/.test(field));
      if (allowed && fields.length) {
        this.query=this.query.sort(fields.join(' '));
      }
  } 
  
    return this;
  }
  
  limitFields(){
  if(this.querystring.fields){
    const fields = String(this.querystring.fields)
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
    const blocked = fields.some(field =>
      field.includes('$') ||
      field.includes('.') ||
      /password/i.test(field)
    );
    if (!blocked && fields.length) {
      this.query = this.query.select(fields.join(' '));
    }
  } 

    return this;
  }

    paginate() {
  let page = Number(this.querystring.page);
  let limit = Number(this.querystring.limit);

  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }
  if (!Number.isFinite(limit) || limit < 1) {
    limit = 10;
  }
  if (limit > 50) {
    limit = 50;
  }

  const skip = (page - 1) * limit;
  this.query = this.query.skip(skip).limit(limit);

  return this;
}

}

function stripDollarKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripDollarKeys);
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const cleaned = {};
  Object.keys(value).forEach(key => {
    if (!key || key.startsWith('$') || key.includes('.')) {
      return;
    }
    cleaned[key] = stripDollarKeys(value[key]);
  });
  return cleaned;
}

module.exports= APIfeatures
