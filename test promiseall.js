



var promises = [];

array.forEach(function(element) {
    promises.push(
        developer.getResources(element)
            .then((data) => {
                name = data.items[0];
                return developer.getResourceContent(element, file);
            })
            .then((response) => {
                fileContent = atob(response.content);
                self.files.push({
                    fileName: fileName,
                    fileType: fileType,
                    content: fileContent
                });
            }).catch ((error) => {
                console.log('Error: ', error);
            })
    );
});

Promise.all(promises).then(() => 
    self.resultingFunction(self.files)
);
