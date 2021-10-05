export function downloadURI(uri: string, name: string) {    
    var link = document.createElement('a');    
    link.download = name;
    link.href = uri;

    document.body.appendChild(link);    
    link.click();    
    URL.revokeObjectURL(link.href)    
    document.body.removeChild(link);
}