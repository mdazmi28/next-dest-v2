import React from 'react';

const AttachmentTable = ({ attachmentData }) => {
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttachmentTable;