jQuery.sap.declare("GridTable.util.Formatter");
sap.ui.demo.walkthrough.Formatter={
 LinkDisplay:function(path){
  if(path!==null){
	  if(path==="R"){
		return true;
	  }else{
		return false;
	  }
  }
 }
};