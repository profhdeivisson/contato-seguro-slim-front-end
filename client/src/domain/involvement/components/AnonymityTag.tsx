import { Tag } from 'antd';

type Props = {
    isAnonymous: boolean;
};

export function AnonymityTag({ isAnonymous }: Props) {
    if (isAnonymous) {
        return <Tag color="warning">Anônimo</Tag>;
    }

    return <Tag color="success">Identificado</Tag>;
}
