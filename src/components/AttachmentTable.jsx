import React from 'react';

const AttachmentTable = ({ attachmentData }) => {
    function handleDownload(event, filePath) {
        event.preventDefault();

        const baseUrl = "https://nd-api.nakhlah.xyz";
        const fullUrl = baseUrl + filePath;
        const filename = filePath.split("/").pop();

        fetch(fullUrl)
            .then(response => response.blob()) // Convert response to Blob
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl); // Clean up memory
            })
            .catch(error => console.error("Download error:", error));
    }

    return (
        <div>

            <table className='table'>
                <thead>
                    <tr>
                        <th>Attachment ID</th>
                        <th>File Path</th>
                        <th>Note</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {attachmentData.map((attachment) => (
                        <tr key={attachment.attachment_id}>
                            <td>{attachment.attachment_id}</td>
                            <td>{attachment.file_path}</td>
                            <td>{attachment.note}</td>
                            <td>
                                <a
                                    href={`https://nd-api.nakhlah.xyz/${attachment.file_path}`}
                                    target='_blank'
                                    download={attachment.file_path.split('/').pop()}
                                >
                                    Download
                                </a>
                            </td>

                            {/* <td>
    <a href="#" onClick={(e) => handleDownload(e, attachment.file_path)}>
        Download
    </a>
</td> */}

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttachmentTable;