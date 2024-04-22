//These are mock data for the sake of UI development. It will no
//longer be of any use and this file will
//be removed after API integration. Data should be dynamic, right?

import { IAssignee } from '@/types/interfaces'

//This is mock data which will be replaced after API integration.
export const assignee: IAssignee[] = [
  {
    type: '',
    name: 'No Assignee',
  },
  {
    img: 'https://avatar.iran.liara.run/public/1',
    type: 'Internal users',
    name: 'Jacob Jones',
  },
  {
    img: 'https://avatar.iran.liara.run/public/2',
    type: 'Internal users',
    name: 'Wade Warren',
  },
  {
    img: 'https://avatar.iran.liara.run/public/3',
    type: 'Clients',
    name: 'Brroklyn Simmons',
  },
]

export const taskDetail = {
  title: 'my new task',
  detail: '',
  attachment: [
    {
      name: 'Card',
      fileSize: '244',
      fileType: 'pdf',
    },
    {
      name: 'Screenshot',
      fileSize: '102',
      fileType: 'png',
    },
  ],
}
