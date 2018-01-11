class GuideInfo {
    public id: string; 
    public des: string; 
    public condition: {id:string,param:string}; 
    public action: {condition:{id:string,param:string}[],command:{id:string,param:string}}[]; 
}