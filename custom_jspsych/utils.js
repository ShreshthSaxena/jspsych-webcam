function downloadCSV(csv, filename) {
	var csvfile;
	var downloadlink;

	csvfile = new Blob( [csv], { type: 'text/csv' } );

	downloadlink = document.createElement("a");

	downloadlink.download = filename;

	downloadlink.href = window.URL.createObjectURL(csvfile);

	downloadlink.style.display = "none";

	document.body.appendChild(downloadlink);

	downloadlink.click();	
}