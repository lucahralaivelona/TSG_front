self.onmessage = function (e) {
  const { members, search } = e.data;

  // Formatage de la date
  function formatDate(dateString) {
    const d = new Date(dateString);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  // Trier les membres par date (du plus récent au plus ancien)
  const sorted = [...members].sort((a, b) => {
    return new Date(b.recordTime) - new Date(a.recordTime);
  });

  // Si aucun texte de recherche → renvoyer les 30 premières lignes
  if (!search.trim()) {
    const formatted = sorted.slice(0, 30).map(m => ({
      ...m,
      recordTime: formatDate(m.recordTime)
    }));

    postMessage(formatted);
    return;
  }

  // 🔎 Multi-critères : découpe en mots séparés
  const terms = search.toLowerCase().split(" ").filter(t => t.trim() !== "");

  // Filtrage
  const filtered = sorted.filter((m) => {
    // On concatène toutes les infos en un seul gros texte
    const bigString =
      `${m.deviceUserId}`.toLowerCase() + " " +
      m.employeeId.lastName.toLowerCase() + " " +
      m.employeeId.firstName.toLowerCase() + " " +
      m.employeeId.departmentId.name.toLowerCase() + " " +
      m.recordTime.toLowerCase();

    // Vérifie que TOUS les mots entrés sont présents
    return terms.every(t => bigString.includes(t));
  });

  // Formater les dates avant renvoi
  const formatted = filtered.map(m => ({
    ...m,
    recordTime: formatDate(m.recordTime)
  }));

  postMessage(formatted);
};
