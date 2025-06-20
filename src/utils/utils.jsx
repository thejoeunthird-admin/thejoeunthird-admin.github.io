export const timeAgo = (update_date) => {
    const now = new Date();
    const end = new Date(update_date);
    const diff = now - end;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}일 전`;
    if (hrs > 0) return `${hrs}시간 전`;
    if (mins < 1) return '방금 전'
    return `${mins}분 전`;
};
export const getTimeAgo = (update_date) => {
    const now = new Date();
    const end = new Date(update_date);
    const diff = now - end;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days}일 전`;
    if (hrs > 0) return `${hrs}시간 전`;
    if (mins < 1) return '방금 전'
    return `${mins}분 전`;
  };
export const timeAgoOrClosed = (salesEnd) => {
    if (!salesEnd) return '마감일 없음';
    const now = new Date();
    const end = new Date(salesEnd);
    if (now > end) return '공동구매 종료';
    const diff = end - now;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `공구마감 ${mins}분 전`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `공구마감 ${hrs}시간 전`;
    const days = Math.floor(hrs / 24);
    return `공구마감 ${days}일 전`;
};

export const getCategoryFullName = (categoryId, categoryList) => {
    const category = categoryList.find(c => c.id === categoryId);
    if (!category) return '';
    if (category.parent_id && category.parent_id !== 0) {
        const parent = categoryList.find(c => c.id === category.parent_id);
        return parent ? `${parent.name} > ${category.name}` : category.name;
    }
    return category.name;
};
export const getCategoryFullNameTag = (categoryId, categoryList) => {
    if (!categoryList) return '';
    const category = categoryList.find(c => c.id === categoryId);
    if (!category) return '';
    const parent = categoryList.find(c => c.id === category.parent_id);

    return (
        <>
            {parent && (
                <a href={`/${parent.url}`} className="text-decoration-none text-primary">{parent.name}</a>
            )}
            {parent && ' > '}
            <a href={`/${parent?.url}/${category.url}`} className="text-decoration-none text-dark fw-semibold">
                {category.name}
            </a>
        </>
    );
};

export const getCategoryUrl = (categoryId, categoryList) => {
    if (!categoryList) return '';
    const category = categoryList.find(c => c.id === categoryId);
    if (!category) return '';
    return category.url;
};