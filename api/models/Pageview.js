/**
 * Pageview
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */



module.exports = {

	// autoCreatedAt: false,
  	autoUpdatedAt: false,

  attributes: {
  	
  	id: 'INTEGER',
  	application : {
  		type: 'INTEGER',
  		required: true
  	},
  	url : {
  		type: 'STRING',
  		required: true
  	},
  	uow: 'STRING',
  	custom_parameter: 'STRING',
  	user_agent : 'STRING',
  	browser: 'STRING',
  	major_version: 'STRING',
  	cookies: 'STRING',
  	os: 'STRING'
    
  }
  // ,

  // beforeValidate : function(values, next) {
  //   // console.log("MAIXI");
  //   // console.log(values);
  //   next();
  // },

  // beforeCreate: function(values, next) {
  // 	// console.log(values);

	 // console.log("URLUUUUUUUUUUUUUUUUUU" + values.url);
  //   next();
  // }

};
