class ExportService {
    private baseUrl = "http://localhost:5000/api/export";

    async exportStudentsByTopic(): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/students-by-topic`, {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();

            const contentDisposition = response.headers.get('content-disposition');
            let filename = `studenci_tematy_${new Date().toISOString().split('T')[0]}.xlsx`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting students by topic:", error);
            throw error;
        }
    }
}

export default new ExportService();