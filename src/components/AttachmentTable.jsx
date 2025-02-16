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
            <div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Reference Number</th>
                            <th>Subject</th>
                            <th>File Name</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attachmentData.map((dispatch) => (
                            <React.Fragment key={dispatch.reference_number}>
                                {dispatch.attached_files.map((attachment) => (
                                    <tr key={attachment.attachment_id}>
                                        <td>{dispatch.reference_number}</td>
                                        <td>{dispatch.subject}</td>
                                        <td>{attachment.file_path.split('/').pop()}</td>
                                        <td>
                                            <a
                                                href={`https://nd-api.nakhlah.xyz${attachment.file_path}`}
                                                target='_blank'
                                                rel="noopener noreferrer"
                                                className="btn btn-sm bg-[#0BBFBF]"
                                                download
                                            >
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttachmentTable;